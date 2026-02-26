from image_client import generate_image_pollinations
import os

def test_generation():
    print("Testing Hugging Face Image Generation...")
    try:
        prompt = "minimalist rocket ship logo, vector, flat design, blue and white"
        image_bytes = generate_image_pollinations(prompt)
        
        with open("test_logo.png", "wb") as f:
            f.write(image_bytes)
            
        print("✅ Success! Image saved to test_logo.png")
        print(f"Image size: {len(image_bytes)} bytes")
    except Exception as e:
        print(f"❌ Failed: {e}")

if __name__ == "__main__":
    test_generation()
