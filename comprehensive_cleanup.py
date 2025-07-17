#!/usr/bin/env python3
import re
from pathlib import Path

def comprehensive_cleanup(file_path):
    """Remove all individual auth and theme scripts from HTML files"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    has_changes = False
    
    # Remove individual theme toggle script
    theme_script_pattern = r'<script>\s*// Theme toggle functionality.*?</script>'
    if re.search(theme_script_pattern, content, re.DOTALL):
        content = re.sub(theme_script_pattern, '', content, flags=re.DOTALL)
        has_changes = True
    
    # Remove individual auth management script
    auth_script_pattern = r'<script>\s*// Authentication state management.*?</script>'
    if re.search(auth_script_pattern, content, re.DOTALL):
        content = re.sub(auth_script_pattern, '', content, flags=re.DOTALL)
        has_changes = True
    
    # Remove any standalone checkAuthState functions
    check_auth_pattern = r'function checkAuthState\(\)\s*\{[^}]*\s*\}\s*'
    if re.search(check_auth_pattern, content, re.DOTALL):
        content = re.sub(check_auth_pattern, '', content, flags=re.DOTALL)
        has_changes = True
    
    # Remove any standalone logout event listeners
    logout_pattern = r'document\.querySelector\(\.logout\)\?\..*?checkAuthState\(\);'
    if re.search(logout_pattern, content, re.DOTALL):
        content = re.sub(logout_pattern, '', content, flags=re.DOTALL)
        has_changes = True
    
    # Remove any standalone DOMContentLoaded event listeners for auth
    dom_auth_pattern = r'document\.addEventListener\(.DOMContentLoaded., checkAuthState\);'
    if re.search(dom_auth_pattern, content, re.DOTALL):
        content = re.sub(dom_auth_pattern, '', content, flags=re.DOTALL)
        has_changes = True
    
    # Remove any standalone checkAuthState() calls
    check_auth_call_pattern = r'checkAuthState\(\);'
    if re.search(check_auth_call_pattern, content, re.DOTALL):
        content = re.sub(check_auth_call_pattern, '', content, flags=re.DOTALL)
        has_changes = True
    
    # Clean up any extra whitespace and empty script tags
    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
    content = re.sub(r'<script>\s*</script>', '', content)
    
    if has_changes:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ Cleaned up {file_path}")
    else:
        print(f"✓ No changes needed for {file_path}")

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
        
        comprehensive_cleanup(html_file)
    
    print(f"\n✅ Completed! Cleaned up {len(html_files)} HTML files")

if __name__ == "__main__":
    main() 