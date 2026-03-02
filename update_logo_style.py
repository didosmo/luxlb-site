#!/usr/bin/env python3
import os
import re

ROOT = "/Users/gustaftidholm/Desktop/LUX/LUX Antigravity"

FILES = [
    "contact.html",
    "properties.html",
    "index.html",
    "about/index.html",
    "about/concept.html",
    "process/index.html",
    "process/services.html",
    "process/tours.html",
    "region/marche.html",
    "region/lifestyle.html",
    "region/market-insights.html",
    "region/future-regions.html"
]

def process_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Update Google Fonts to include 800 and 900 for League Spartan
    pattern_fonts = re.compile(r'family=League\+Spartan:wght@500;600;700')
    content = pattern_fonts.sub('family=League+Spartan:wght@500;600;700;800;900', content)

    # 2. Add span around the dot in brand-logo
    pattern_logo = re.compile(r'(class="brand-logo"[^>]*>LUX)(\.)(</a>)')
    content = pattern_logo.sub(r'\1<span class="logo-dot">\2</span>\3', content)

    # 3. Add span around the dot in footer-brand-logo
    pattern_footer_logo = re.compile(r'(class="footer-brand-logo"[^>]*>LUX)(\.)(</a>)')
    content = pattern_footer_logo.sub(r'\1<span class="logo-dot">\2</span>\3', content)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"Updated {filepath}")

for rel_path in FILES:
    full_path = os.path.join(ROOT, rel_path)
    if os.path.exists(full_path):
        process_file(full_path)
