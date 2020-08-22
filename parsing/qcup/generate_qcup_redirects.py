#!/usr/local/bin/python3
import json

# Get list of sheet pubhtml
pubs = None
with open("list.txt") as pubhtmls:
    pubs = [pubhtml.rstrip('\n') for pubhtml in pubhtmls.readlines()]
# print(pubs)

for idx, pub in enumerate(pubs):
    content = """---
title: qc{}-standings
owner: Mic Qsenoch
layout: redirect
redirect: {}
---
""".format(idx + 1, pub)

    with open(f"../../qc{idx+1}-standings.md", 'w') as filetowrite:
        filetowrite.write(content)
