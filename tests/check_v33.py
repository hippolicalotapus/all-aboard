#!/usr/bin/env python3
from pathlib import Path
import subprocess,re,sys
root=Path(__file__).resolve().parents[1]
s=(root/'source/all-aboard-personal.html').read_text()
assert "const KEY='onboardflow-fictional-wallet-v2'" in s
assert "onboardflow-fictional-v2" in s
assert "EDIT FAILED: Browser storage failed; wallet unchanged" in s
assert "DELETE FAILED: Browser storage failed; wallet unchanged" in s
assert "remember();Object.assign(item,updated)" not in s
assert "remember();wallet=wallet.filter" not in s
assert s.count("undoSnapshot=before;$('undo').disabled=false")>=4
assert "if(!persist()){wallet=before;render()" in s
assert "if(!persist()){wallet=current;render()" in s
scripts=re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>',s,re.S)
assert scripts
for js in scripts:
 result=subprocess.run(['node','--check','--input-type=commonjs'],input=js,text=True,capture_output=True)
 if result.returncode: print(result.stderr);sys.exit(result.returncode)
print('PASS: 10 regression assertions and JavaScript syntax for',len(scripts),'script(s)')
