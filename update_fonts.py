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

    # Search for the existing Google Fonts link
    # <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
    # Replace it with the new link that includes League Spartan
    
    pattern = re.compile(r'<link[^>]*href="https://fonts\.googleapis\.com/css2\?family=Montserrat[^"]*"[^>]*>')
    
    new_link = '<link href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@500;600;700&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">'
    
    content = pattern.sub(new_link, content)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"Updated {filepath}")

for rel_path in FILES:
    full_path = os.path.join(ROOT, rel_path)
    if os.path.exists(full_path):
        process_file(full_path)
