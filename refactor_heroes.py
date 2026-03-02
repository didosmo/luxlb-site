#!/usr/bin/env python3
import os
import re

ROOT = "/Users/gustaftidholm/Desktop/LUX/LUX Antigravity"

PAGES = [
    "about/index.html",
    "about/concept.html",
    "process/index.html",
    "process/services.html",
    "process/tours.html",
    "region/marche.html",
    "region/lifestyle.html",
    "region/market-insights.html",
    "region/future-regions.html",
    "contact.html",
    "properties.html",
    "index.html"
]

def update_subpage(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Determine depth for asset path
    is_root = filepath.endswith("contact.html") or filepath.endswith("properties.html") or filepath.endswith("index.html")
    asset_prefix = "" if is_root else "../"

    if filepath.endswith("index.html"):
        content = re.sub(
            r'<section\s+id="home"\s+class="hero\s+visible"\s*>',
            f'''<section id="home" class="hero hero-primary visible" style="background-image: url('{asset_prefix}assets/hero-bg.jpg');">''',
            content
        )
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated index.html")
        return
        
    hero_class = "hero-minimal" if filepath.endswith("contact.html") or filepath.endswith("properties.html") else "hero-secondary"

    content = content.replace('<main class="page-header">', '<main>')

    match = re.search(r'<section\s+id="([^"]+)"\s+class="visible">\s*<div\s+class="container">\s*<div\s+class="text-left-desktop[^"]*">\s*(<span[^>]*>.*?</span>)\s*(<h2[^>]*>.*?</h2>)\s*(<p[^>]*>.*?</p>)?', content, re.DOTALL)
    
    if match:
        section_id = match.group(1)
        span_html = match.group(2)
        h2_html = match.group(3)
        p_html = match.group(4) or ""

        h1_html = h2_html.replace("<h2", "<h1").replace("</h2>", "</h1>")
        
        new_hero = f'''<!-- Hero Section -->
        <section class="hero {hero_class} visible" style="background-image: url('{asset_prefix}assets/hero-bg.jpg');">
            <div class="hero-content">
                {span_html}
                {h1_html}
            </div>
        </section>

        <!-- Main Content -->
        <section id="{section_id}" class="visible">
            <div class="container">
                <div class="text-left-desktop mb-80">
                    {p_html}'''

        full_match_str = match.group(0)
        content = content.replace(full_match_str, new_hero)
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {filepath}")
    else:
        match_contact = re.search(r'<section\s+id="([^"]+)"\s+class="visible">\s*<div\s+class="container">\s*<div\s+class="grid-2">\s*<div\s+class="text-left-desktop">\s*(<span[^>]*>.*?</span>)\s*(<h2[^>]*>.*?</h2>)\s*(<p[^>]*>.*?</p>)?', content, re.DOTALL)
        
        if match_contact:
            section_id = match_contact.group(1)
            span_html = match_contact.group(2)
            h2_html = match_contact.group(3)
            p_html = match_contact.group(4) or ""
            
            h1_html = h2_html.replace("<h2", "<h1").replace("</h2>", "</h1>")
            
            new_hero = f'''<!-- Hero Section -->
        <section class="hero {hero_class} visible" style="background-image: url('{asset_prefix}assets/hero-bg.jpg');">
            <div class="hero-content">
                {span_html}
                {h1_html}
            </div>
        </section>

        <!-- Main Content -->
        <section id="{section_id}" class="visible">
            <div class="container">
                <div class="grid-2">
                    <div class="text-left-desktop">
                        {p_html}'''
            
            full_match_str = match_contact.group(0)
            content = content.replace(full_match_str, new_hero)
            
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Updated {filepath} (Grid layout)")
        else:
            print(f"Could not parse {filepath}")

for rel_path in PAGES:
    update_subpage(os.path.join(ROOT, rel_path))
