#!/usr/bin/env python3
import os
import re

ROOT = "/Users/gustaftidholm/Desktop/LUX/LUX Antigravity"

FILES = {
    "contact.html":                   "",
    "properties.html":                "",
    "about/index.html":               "../",
    "about/concept.html":             "../",
    "process/index.html":             "../",
    "process/services.html":          "../",
    "process/tours.html":             "../",
    "region/marche.html":             "../",
    "region/lifestyle.html":          "../",
    "region/market-insights.html":    "../",
    "region/future-regions.html":     "../",
    "index.html":                     ""
}

def process_file(filepath, prefix):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Nav logo replacement
    # We look for <div class="logo">...</div> and replace it with a text anchor
    
    # We know in step 177 / 180 it became:
    # <div class="logo">
    #     <img src="...assets/logo.png" alt="LUX" onclick="window.location.href='...index.html'" style="cursor:pointer;" />
    # </div>
    
    # We replace the whole div with:
    # <a href="{prefix}index.html" class="brand-logo">LUX.</a>
    
    pattern_nav_logo = re.compile(r'<div class="logo">\s*<img[^>]+src="[^"]*logo\.png"[^>]+>\s*</div>', re.IGNORECASE)
    nav_logo_text = f'<a href="{prefix}index.html" class="brand-logo">LUX.</a>'
    content = pattern_nav_logo.sub(nav_logo_text, content)

    # Footer logo replacement
    # <img src="...assets/logo.png" alt="LUX" onclick="window.location.href='...index.html'" style="cursor:pointer;" />
    pattern_footer_logo = re.compile(r'<img[^>]+src="[^"]*logo\.png"[^>]+alt="LUX"[^>]*>', re.IGNORECASE)
    footer_logo_text = f'<a href="{prefix}index.html" class="footer-brand-logo">LUX.</a>'
    content = pattern_footer_logo.sub(footer_logo_text, content)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"Updated {filepath}")

for rel_path, prefix in FILES.items():
    full_path = os.path.join(ROOT, rel_path)
    if os.path.exists(full_path):
        process_file(full_path, prefix)
