
import os

html_path = 'index.html'
grid_path = '/Users/anvijain/.gemini/antigravity/brain/e159072a-3ad1-4477-baff-5da531782f55/projects_grid.html'

with open(html_path, 'r') as f:
    content = f.read()

with open(grid_path, 'r') as f:
    new_section = f.read()

# Markers
marker = '<!-- Blog Section -->'

marker_idx = content.find(marker)

if marker_idx != -1:
    print(f"Found marker. Inserting content before index {marker_idx}")
    # Insert new content before marker
    new_content = content[:marker_idx] + new_section + "\n\n            " + content[marker_idx:]
    
    with open(html_path, 'w') as f:
        f.write(new_content)
    print("Insertion successful.")
else:
    print("Marker not found!")
    print(f"Marker found: {marker_idx}")
