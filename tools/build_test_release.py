#!/usr/bin/env python3
"""Build the self-contained, fictional-data phone test artifact; no deployment."""
from pathlib import Path
from html.parser import HTMLParser
import hashlib
root=Path(__file__).resolve().parents[1]
source=root/'source/all-aboard-personal.html'
class Check(HTMLParser):
    def __init__(self): super().__init__();self.ids=set();self.sections=0
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:
            if a['id'] in self.ids: raise ValueError('Duplicate element ID')
            self.ids.add(a['id'])
        if tag=='script' and 'src' in a: raise ValueError('Release must not require external scripts')
        if tag=='section': self.sections+=1
    def handle_endtag(self,tag):
        if tag=='section': self.sections-=1
        if self.sections<0: raise ValueError('Unbalanced workspace sections')
raw=source.read_bytes();parser=Check();parser.feed(raw.decode());assert parser.sections==0
for name in ['walletWorkspace','companyWorkspace','testingWorkspace','openWallet','openCompany']: assert name in parser.ids
out=root/'dist/Employee_Onboarding_Test_v39.html';out.parent.mkdir(exist_ok=True);out.write_bytes(raw)
print(str(out));print('SHA256',hashlib.sha256(raw).hexdigest())
