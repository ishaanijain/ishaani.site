
import os

css_path = 'styles.css'
new_css_path = '/Users/anvijain/.gemini/antigravity/brain/e159072a-3ad1-4477-baff-5da531782f55/projects_styles.css'

with open(css_path, 'r') as f:
    content = f.read()

with open(new_css_path, 'r') as f:
    new_css = f.read()

# Markers
start_marker = '/* PROJECTS SECTION (HORIZONTAL SCROLL)'
end_marker = '/* CONTACT'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    print(f"Found markers. Replacing content between indices {start_idx} and {end_idx}")
    # Replace content, inserting new CSS + preserving the Contact marker
    # Also add some newlines for spacing
    new_content = content[:start_idx] + new_css + "\n\n/* -------------------------------------- */\n" + content[end_idx:]
    
    with open(css_path, 'w') as f:
        f.write(new_content)
    print("Replacement successful.")
else:
    print("Markers not found!")
    print(f"Start found: {start_idx}")
    print(f"End found: {end_idx}")
