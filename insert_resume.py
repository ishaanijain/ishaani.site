
import os

html_path = 'index.html'
resume_path = '/Users/anvijain/.gemini/antigravity/brain/e159072a-3ad1-4477-baff-5da531782f55/resume_section.html'

with open(html_path, 'r') as f:
    content = f.read()

with open(resume_path, 'r') as f:
    new_section = f.read()

# Marker: Insert BEFORE the Blog Section
marker = '<!-- Blog Section -->'

marker_idx = content.find(marker)

if marker_idx != -1:
    print(f"Found marker. Inserting Resume section before index {marker_idx}")
    # Insert new content before marker
    new_content = content[:marker_idx] + new_section + "\n\n            " + content[marker_idx:]
    
    with open(html_path, 'w') as f:
        f.write(new_content)
    print("Insertion successful.")
else:
    print("Marker not found!")
