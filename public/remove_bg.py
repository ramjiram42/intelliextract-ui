from PIL import Image

def process_image(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    # Top-left pixel is the dark grey background of the icon we want to remove
    bg_color = data[0]
    
    new_data = []
    
    # A generous tolerance to catch anti-aliasing against the dark grey, 
    # but not enough to affect the gold/yellow or white.
    # Distance threshold:
    tolerance = 60
    
    for item in data:
        # Distance between current pixel and background color
        diff = sum(abs(item[i] - bg_color[i]) for i in range(3))
        
        if diff < tolerance:
            # Replace with exact black #000000
            new_data.append((0, 0, 0, item[3]))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    process_image("logo.png", "logo.png")
    print("Background replaced with black.")
