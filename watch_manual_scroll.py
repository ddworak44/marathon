#!/usr/bin/env python3
"""Record Android Maps UI text while a person scrolls or opens places."""

import csv
import json
import re
import subprocess
import time
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path


SCREENS = Path("manual_scroll_screens.jsonl")
PLACES = Path("manual_scroll_places.csv")


def adb(*args):
    return subprocess.check_output(["adb", *args], text=True, timeout=30)


def visible_screen():
    adb("shell", "uiautomator", "dump", "/sdcard/manual-scroll.xml")
    root = ET.fromstring(adb("shell", "cat", "/sdcard/manual-scroll.xml"))
    all_labels = []
    for node in root.iter("node"):
        label = node.get("text") or node.get("content-desc")
        if label:
            all_labels.append(label)

    cards = []
    for recycler in root.iter("node"):
        if recycler.get("resource-id") != "com.google.android.apps.maps:id/recycler_view":
            continue
        for card in recycler:
            labels = [n.get("text") or n.get("content-desc") for n in card.iter("node")]
            labels = [label for label in labels if label]
            save = next((x for x in labels if x.startswith("Save ") and x.endswith(" to lists")), None)
            if not save:
                continue
            attribution = next((x for x in labels if re.match(r"^(Added|Edited) by ", x)), "")
            cards.append({
                "place": save[5:-9],
                "attribution": attribution,
                "labels": labels,
            })
    return all_labels, cards


def write_places(rows):
    with PLACES.open("w", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=["place", "attribution", "first_captured_at_utc", "visible_labels_json"])
        writer.writeheader()
        writer.writerows(rows.values())


def main():
    seen_screens = set()
    places = {}
    print(f"Watching emulator. Writing {SCREENS} and {PLACES}. Press Ctrl-C to stop.", flush=True)
    try:
        while True:
            try:
                labels, cards = visible_screen()
            except (subprocess.SubprocessError, ET.ParseError) as error:
                print(f"Capture failed; retrying: {error}", flush=True)
                time.sleep(1)
                continue
            signature = json.dumps(labels, ensure_ascii=False)
            if signature not in seen_screens:
                seen_screens.add(signature)
                stamp = datetime.now(timezone.utc).isoformat()
                with SCREENS.open("a") as file:
                    file.write(json.dumps({"captured_at_utc": stamp, "labels": labels, "cards": cards}, ensure_ascii=False) + "\n")
                changed = 0
                for card in cards:
                    name = card["place"]
                    old = places.get(name)
                    if old is None or (bool(card["attribution"]), len(card["labels"])) > (
                        bool(old["attribution"]), len(json.loads(old["visible_labels_json"]))
                    ):
                        places[name] = {
                            "place": name,
                            "attribution": card["attribution"],
                            "first_captured_at_utc": old["first_captured_at_utc"] if old else stamp,
                            "visible_labels_json": json.dumps(card["labels"], ensure_ascii=False),
                        }
                        changed += 1
                if changed:
                    write_places(places)
                print(f"screen {len(seen_screens)}: {len(cards)} cards, {len(places)} places saved", flush=True)
            time.sleep(0.5)
    except KeyboardInterrupt:
        write_places(places)
        print(f"Stopped. Captured {len(seen_screens)} screens and {len(places)} places.", flush=True)


if __name__ == "__main__":
    main()
