#!/usr/bin/env python3
"""Continue the Android UI export from its current scroll position."""

import csv
import json
import time
from collections import OrderedDict
from pathlib import Path

from export_maps_attribution import adb, cards


RAW = Path("worldwide_scran_attribution_raw.json")
OUT = Path("worldwide_scran_attribution.csv")


def quality(card):
    return (bool(card["attribution"]), len(card["labels"]))


def write(rows):
    RAW.write_text(json.dumps(list(rows.values()), ensure_ascii=False, indent=2))
    with OUT.open("w", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=["place", "attribution"])
        writer.writeheader()
        writer.writerows({key: card[key] for key in ("place", "attribution")}
                         for card in rows.values())


def main():
    rows = OrderedDict()
    for card in json.loads(RAW.read_text()):
        name = card["place"]
        if name not in rows or quality(card) > quality(rows[name]):
            rows[name] = card
    print(f"Starting from {len(rows)} unique place names", flush=True)
    stale = 0
    for swipe in range(250):
        visible = cards()
        new = 0
        upgraded = 0
        for card in visible:
            name = card["place"]
            if name not in rows:
                rows[name] = card
                new += 1
            elif quality(card) > quality(rows[name]):
                rows[name] = card
                upgraded += 1
        if swipe % 10 == 0 or new == 0:
            print(f"swipe={swipe} visible={len(visible)} new={new} upgraded={upgraded} total={len(rows)}", flush=True)
            write(rows)
        stale = stale + 1 if new == 0 else 0
        if stale >= 5:
            break
        adb("shell", "input", "swipe", "500", "2060", "500", "550", "380")
        time.sleep(0.3)
    write(rows)
    print(f"Saved {len(rows)} unique place names to {OUT}", flush=True)


if __name__ == "__main__":
    main()
