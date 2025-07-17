#!/usr/bin/env python3
import re
from pathlib import Path

def cleanup_individual_scripts(file_path):
    """Remove individual theme toggle and auth management scripts from HTML files"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if this file has individual scripts that need to be removed
    has_individual_scripts = False
    
    # Remove individual theme toggle script
    theme_script_pattern = r'<script>\s*// Theme toggle functionality.*?</script>'
    if re.search(theme_script_pattern, content, re.DOTALL):
        content = re.sub(theme_script_pattern, '', content, flags=re.DOTALL)
        has_individual_scripts = True
    
    # Remove individual auth management script
    auth_script_pattern = r'<script>\s*// Authentication state management.*?</script>'
    if re.search(auth_script_pattern, content, re.DOTALL):
        content = re.sub(auth_script_pattern, '', content, flags=re.DOTALL)
        has_individual_scripts = True
    
    # Clean up any extra whitespace
    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
    
    if has_individual_scripts:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ Cleaned up individual scripts from {file_path}")
    else:
        print(f"✓ No individual scripts found in {file_path}")

def main():
    """Main function to clean up all HTML files"""
    
    # Get all HTML files in the current directory
    html_files = list(Path('.').glob('*.html'))
    
    print(f"Found {len(html_files)} HTML files to clean up")
    
    for html_file in html_files:
        print(f"\nProcessing {html_file}...")
        
        # Skip index.html as it already has the global functionality
        if html_file.name == 'index.html':
            print("✓ Skipping index.html (already has global functionality)")
            continue
        
        cleanup_individual_scripts(html_file)
    
    print(f"\n✅ Completed! Cleaned up {len(html_files)} HTML files")

if __name__ == "__main__":
    main() 