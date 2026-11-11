#!/usr/bin/env python3
"""Extract inline JS from a local HTML file and check syntax with Node."""
import pathlib
import re
import subprocess
import sys
import tempfile

def main():
    path = pathlib.Path(sys.argv[1])
    text = path.read_text(encoding="utf-8")
    scripts = re.findall(r"<script\\b([^>]*)>(.*?)</script\\s*>", text, flags=re.I | re.S)
    checked = 0
    for attrs, script in scripts:
        if re.search(r"\\bsrc\\s*=", attrs, re.I) or not script.strip():
            continue
        with tempfile.NamedTemporaryFile(mode="w", suffix=".js", encoding="utf-8") as f:
            f.write(script)
            f.flush()
            subprocess.run(["node", "--check", f.name], check=True)
            checked += 1
    if checked == 0:
        raise SystemExit("No inline JavaScript found to validate")
    print(f"Validated {checked} inline JavaScript block(s) in {path}")

if __name__ == "__main__":
    main()
