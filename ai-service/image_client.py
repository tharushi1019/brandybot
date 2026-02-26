import requests
import os
from dotenv import load_dotenv
import urllib.parse

load_dotenv()

# Pollinations.ai is a free, no-key text-to-image API
POLLINATIONS_URL = "https://image.pollinations.ai/prompt"

def generate_image_pollinations(prompt: str) -> bytes:
    """
    Generate an image using Pollinations.ai (Free, No Key).
    Args:
        prompt (str): The text prompt for the image.
    Returns:
        bytes: The generated image content.
    Raises:
        Exception: If the API call fails.
    """
    # Pollinations uses URL parameters for the prompt
    encoded_prompt = urllib.parse.quote(prompt)
    url = f"{POLLINATIONS_URL}/{encoded_prompt}"

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.content
    except requests.exceptions.RequestException as e:
        print(f"Pollinations API Error: {e}")
        if response.content:
             print(f"Error Details: {response.content.decode('utf-8')}")
        raise e

# Alias for compatibility if needed, but better to update calls
generate_image_hf = generate_image_pollinations
