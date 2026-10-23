#!/usr/bin/env python3
"""Export visible Google Maps Android list attribution via the emulator UI."""

import csv
import json
import re
import subprocess
import time
import xml.etree.ElementTree as ET
from pathlib import Path


URL = "https://maps.app.goo.gl/wfAw3sM83FyVR2477"
OUT = Path("worldwide_scran_attribution.csv")
RAW = Path("worldwide_scran_attribution_raw.json")
MAX_SWIPES = 350


def adb(*args):
    return subprocess.check_output(["adb", *args], text=True, timeout=30)


def cards():
    adb("shell", "uiautomator", "dump", "/sdcard/maps-list.xml")
    root = ET.fromstring(adb("shell", "cat", "/sdcard/maps-list.xml"))
    for recycler in root.iter("node"):
        if recycler.get("resource-id") != "com.google.android.apps.maps:id/recycler_view":
            continue
        result = []
        for card in recycler:
            labels = [n.get("text") or n.get("content-desc") for n in card.iter("node")]
            labels = [label for label in labels if label]
            save = next((x for x in labels if x.startswith("Save ") and x.endswith(" to lists")), None)
            if not save:
                continue
            name = save[5:-9]
            attr = next((x for x in labels if re.match(r"^(Added|Edited) by ", x)), "")
            result.append({"place": name, "attribution": attr, "labels": labels})
        return result
    return []


def main():
    adb("shell", "am", "start", "-a", "android.intent.action.VIEW", "-d", URL)
    time.sleep(1)
    adb("shell", "input", "swipe", "480", "1710", "480", "450", "500")
    time.sleep(0.5)
    all_cards = []
    seen = set()
    stale = 0
    for swipe in range(MAX_SWIPES):
        visible = cards()
        new = 0
        for card in visible:
            signature = (card["place"], card["attribution"], tuple(card["labels"]))
            if signature in seen:
                continue
            seen.add(signature)
            all_cards.append(card)
            new += 1
        if swipe % 20 == 0 or new == 0:
            print(f"swipe={swipe} visible={len(visible)} new={new} total={len(all_cards)}", flush=True)
        stale = stale + 1 if new == 0 else 0
        if stale >= 4:
            break
        adb("shell", "input", "swipe", "500", "2060", "500", "550", "380")
        time.sleep(0.3)

    RAW.write_text(json.dumps(all_cards, ensure_ascii=False, indent=2))
    with OUT.open("w", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=["place", "attribution"])
        writer.writeheader()
        writer.writerows({k: card[k] for k in ("place", "attribution")} for card in all_cards)
    print(f"Saved {len(all_cards)} places to {OUT}", flush=True)


if __name__ == "__main__":
    main()
