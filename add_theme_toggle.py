#!/usr/bin/env python3
import os
import re
from pathlib import Path

def add_theme_toggle_to_file(file_path):
    """Add theme toggle button to the settings menu in an HTML file"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if theme toggle already exists
    if 'id="theme-toggle"' in content:
        print(f"✓ Theme toggle already exists in {file_path}")
        return
    
    # Pattern to find the settings menu
    settings_menu_pattern = r'<div class="settings-menu">(.*?)</div>'
    
    def replace_settings_menu(match):
        menu_content = match.group(1)
        
        # Check if logout button exists
        if 'class="settings-item logout"' in menu_content:
            # Add theme toggle after logout
            new_content = menu_content.replace(
                '<a href="#" class="settings-item logout">Logout</a>',
                '<a href="#" class="settings-item logout">Logout</a>\n                    <button id="theme-toggle" class="settings-item" aria-label="Toggle light or dark mode" tabindex="0">Toggle Light/Dark Mode</button>'
            )
        else:
            # Add theme toggle at the end
            new_content = menu_content + '\n                    <button id="theme-toggle" class="settings-item" aria-label="Toggle light or dark mode" tabindex="0">Toggle Light/Dark Mode</button>'
        
        return f'<div class="settings-menu">{new_content}</div>'
    
    # Replace the settings menu
    new_content = re.sub(settings_menu_pattern, replace_settings_menu, content, flags=re.DOTALL)
    
    # Add theme toggle JavaScript if not already present
    if 'theme-toggle' not in content:
        # Find the closing body tag
        body_close_pattern = r'(\s*)</body>(\s*)</html>'
        
        def add_theme_script(match):
            indent = match.group(1)
            return f'{indent}    <script>\n        // Theme toggle functionality\n        const themeToggle = document.getElementById("theme-toggle");\n        \n        function setTheme(mode) {{\n            if (mode === "light") {{\n                document.body.classList.add("light-mode");\n                themeToggle.textContent = "Switch to Dark Mode";\n            }} else {{\n                document.body.classList.remove("light-mode");\n                themeToggle.textContent = "Switch to Light Mode";\n            }}\n            localStorage.setItem("theme", mode);\n        }}\n        \n        function loadTheme() {{\n            const saved = localStorage.getItem("theme");\n            setTheme(saved === "light" ? "light" : "dark");\n        }}\n        \n        themeToggle?.addEventListener("click", () => {{\n            const isLight = document.body.classList.contains("light-mode");\n            setTheme(isLight ? "dark" : "light");\n        }});\n        \n        loadTheme();\n    </script>\n</body>\n</html>'
        
        new_content = re.sub(body_close_pattern, add_theme_script, new_content)
    
    # Write the updated content back to the file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✓ Added theme toggle to {file_path}")

def add_auth_management_to_file(file_path):
    """Add authentication management for logout button visibility"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if auth management already exists
    if 'checkAuthState' in content and 'logout' in content:
        print(f"✓ Auth management already exists in {file_path}")
        return
    
    # Add auth management JavaScript
    body_close_pattern = r'(\s*)</body>(\s*)</html>'
    
    def add_auth_script(match):
        indent = match.group(1)
        auth_script = f'''
        // Authentication state management
        function checkAuthState() {{
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            const logoutButton = document.querySelector('.logout');
            const authButtons = document.querySelectorAll('.auth-button');
            const profileButton = document.querySelector('.profile-button');
            
            if (isLoggedIn) {{
                // User is logged in - show logout, hide auth buttons, show profile
                if (logoutButton) logoutButton.style.display = 'block';
                authButtons.forEach(btn => btn.style.display = 'none');
                if (profileButton) profileButton.style.display = 'flex';
            }} else {{
                // User is not logged in - hide logout, show auth buttons, hide profile
                if (logoutButton) logoutButton.style.display = 'none';
                authButtons.forEach(btn => btn.style.display = 'block');
                if (profileButton) profileButton.style.display = 'none';
            }}
        }}
        
        // Handle logout
        document.querySelector('.logout')?.addEventListener('click', function(e) {{
            e.preventDefault();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('user');
            checkAuthState();
            
            // Close settings menu if it exists
            const settingsMenu = document.querySelector('.settings-menu');
            if (settingsMenu) settingsMenu.style.display = 'none';
        }});
        
        // Initialize auth state on page load
        document.addEventListener('DOMContentLoaded', checkAuthState);
        checkAuthState();
        {indent}'''
        return f'{auth_script}</body>\n</html>'
    
    new_content = re.sub(body_close_pattern, add_auth_script, content)
    
    # Write the updated content back to the file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✓ Added auth management to {file_path}")

def add_light_mode_styles_to_file(file_path):
    """Add light mode CSS styles to an HTML file"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if light mode styles already exist
    if 'body.light-mode' in content:
        print(f"✓ Light mode styles already exist in {file_path}")
        return
    
    # Find the closing style tag
    style_close_pattern = r'(\s*)</style>'
    
    def add_light_styles(match):
        indent = match.group(1)
        light_styles = f'''
        /* Light Mode Styles */
        body.light-mode {{
            background: #f8f9fa;
            color: #333;
        }}

        body.light-mode .hero-section {{
            background: linear-gradient(135deg, #e9ecef 0%, #f8f9fa 100%);
            color: #495057;
        }}

        body.light-mode .guide-section,
        body.light-mode .guide-card,
        body.light-mode .guide-progress {{
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid #dee2e6;
            color: #495057;
        }}

        body.light-mode .guide-card h2 {{
            color: #007bff;
        }}

        body.light-mode .guide-card p,
        body.light-mode .guide-tips li {{
            color: #6c757d;
        }}

        body.light-mode .guide-tips h3 {{
            color: #007bff;
        }}

        body.light-mode .guide-tips {{
            background: rgba(248, 249, 250, 0.8);
            border: 1px solid #dee2e6;
        }}

        body.light-mode .guide-number {{
            background: linear-gradient(45deg, #007bff, #0056b3);
            color: white;
        }}

        body.light-mode .tool-link {{
            color: #007bff;
            border: 1px solid #007bff;
        }}

        body.light-mode .tool-link:hover {{
            background: rgba(0, 123, 255, 0.1);
        }}

        body.light-mode .guide-progress h3 {{
            color: #007bff;
        }}

        body.light-mode .guide-progress h3::after {{
            background: #007bff;
        }}

        body.light-mode .progress-list li {{
            color: #6c757d;
            background: rgba(248, 249, 250, 0.8);
            border: 1px solid #dee2e6;
        }}

        body.light-mode .progress-list li::before {{
            background: #007bff;
        }}

        body.light-mode .progress-list li:hover {{
            background: rgba(0, 123, 255, 0.1);
            color: #007bff;
            border-color: #007bff;
        }}

        body.light-mode .progress-list li.active {{
            background: rgba(0, 123, 255, 0.1);
            color: #007bff;
            border-color: #007bff;
        }}

        body.light-mode .progress-list li.active::before {{
            background: #007bff;
        }}

        body.light-mode .progress-list li.completed {{
            color: #28a745;
            background: rgba(40, 167, 69, 0.1);
        }}

        body.light-mode .progress-list li.completed::before {{
            background: #28a745;
        }}

        body.light-mode .bookmark-button {{
            background: linear-gradient(45deg, #007bff, #0056b3);
        }}

        body.light-mode .tooltip {{
            background: rgba(255, 255, 255, 0.95);
            color: #007bff;
            border: 1px solid #007bff;
        }}
        {indent}'''
        return f'{light_styles}</style>'
    
    new_content = re.sub(style_close_pattern, add_light_styles, content)
    
    # Write the updated content back to the file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✓ Added light mode styles to {file_path}")

def main():
    """Main function to process all HTML files"""
    
    # Get all HTML files in the current directory
    html_files = list(Path('.').glob('*.html'))
    
    print(f"Found {len(html_files)} HTML files")
    
    for html_file in html_files:
        print(f"\nProcessing {html_file}...")
        
        # Skip index.html as it already has the theme toggle and auth management
        if html_file.name == 'index.html':
            print("✓ Skipping index.html (already has theme toggle and auth management)")
            continue
        
        # Add theme toggle button
        add_theme_toggle_to_file(html_file)
        
        # Add auth management for logout button visibility
        add_auth_management_to_file(html_file)
        
        # Add light mode styles (only for files that need them)
        if html_file.name in ['featured-guides.html']:
            add_light_mode_styles_to_file(html_file)
    
    print(f"\n✅ Completed! Processed {len(html_files)} HTML files")

if __name__ == "__main__":
    main() 