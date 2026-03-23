from PIL import Image

def is_background(r, g, b):
    # The background is composed of pure black (#000000) and the slate box (#232530).
    # Both are very dark. The logo components (circle, text) are gold/yellow and white.
    # Gold is roughly (242, 169, 0), so R and G are very high.
    # To aggressively and cleanly eat the slate box and black padding, 
    # we swallow any pixel that is reasonably dark and not strongly red/green.
    return r < 100 and g < 100 and b < 130

def process_image():
    input_path = "logo.png"
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    visited = set()
    queue = []
    
    # Initialize BFS from all perimeter pixels
    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))
        
    valid_queue = []
    for q in queue:
        x, y = q
        r, g, b, a = pixels[x, y]
        if is_background(r, g, b):
            valid_queue.append(q)
            visited.add(q)
            
    queue = valid_queue
    head = 0
    
    while head < len(queue):
        cx, cy = queue[head]
        head += 1
        
        # Turn it to exact black
        r, g, b, a = pixels[cx, cy]
        pixels[cx, cy] = (0, 0, 0, a)
        
        # Check neighbors
        for nx, ny in [(cx-1, cy), (cx+1, cy), (cx, cy-1), (cx, cy+1)]:
            if 0 <= nx < width and 0 <= ny < height:
                if (nx, ny) not in visited:
                    nr, ng, nb, na = pixels[nx, ny]
                    if is_background(nr, ng, nb):
                        visited.add((nx, ny))
                        queue.append((nx, ny))

    img.save(input_path, "PNG")
    print(f"BFS processed and blackened {len(visited)} boundary pixels.")

if __name__ == "__main__":
    process_image()
