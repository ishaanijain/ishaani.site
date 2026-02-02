
import os

html_path = 'index.html'
new_post_path = '/Users/anvijain/.gemini/antigravity/brain/e159072a-3ad1-4477-baff-5da531782f55/new_blog_post.html'

with open(html_path, 'r') as f:
    content = f.read()

with open(new_post_path, 'r') as f:
    new_post_content = f.read()

# Marker: We want to insert this AFTER the start of .blog-grid but BEFORE the closing div of blog-grid?
# Or just after the first card.
# The first card ends with </div> (nested).
# Let's find <div class="blog-grid"> and insert after it, effectively putting it first?
# Or insert after the existing card. 

# Let's try to find the END of the first blog card.
# It has id="post-1".
marker = 'id="post-1">'
start_idx = content.find(marker)

if start_idx != -1:
    # Find the closing tag of this div. This is tricky with simple find.
    # Alternative: Insert immediately AFTER <div class="blog-grid"> so it appears FIRST.
    # This is often better for "newest first".
    
    grid_marker = '<div class="blog-grid">'
    grid_idx = content.find(grid_marker)
    
    if grid_idx != -1:
        insert_idx = grid_idx + len(grid_marker)
        print(f"Found grid start. Inserting at {insert_idx}")
        new_content = content[:insert_idx] + "\n" + new_post_content + "\n" + content[insert_idx:]
        
        with open(html_path, 'w') as f:
            f.write(new_content)
        print("Insertion successful.")
    else:
        print("Blog grid not found!")
else:
    print("Post 1 not found!")
