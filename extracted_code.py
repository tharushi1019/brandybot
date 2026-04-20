!pip install -q diffusers transformers accelerate safetensors gdown pyngrok fastapi uvicorn pillow

import gdown

url = "https://drive.google.com/uc?id=1eLSUDSVVVHM5pGmAK94B9BRJtjwzFLZM"
output = "brandybot_lora.safetensors"

gdown.download(url, output, quiet=False)

!ls -lh

import torch
from diffusers import StableDiffusionXLPipeline

base_model = "stabilityai/stable-diffusion-xl-base-1.0"

pipe = StableDiffusionXLPipeline.from_pretrained(
    base_model,
    torch_dtype=torch.float16,
    variant="fp16",
    use_safetensors=True
).to("cuda")

# Load your trained LoRA
pipe.load_lora_weights(
    ".",
    weight_name="brandybot_lora.safetensors"
)

pipe.fuse_lora()

print("✅ SDXL + LoRA loaded successfully")

prompt1 = "modern minimal logo for a tech startup, flat vector style, brand identity"
negative_prompt1 = "blurry, low quality, watermark, text"

prompt = "A high-end professional logo design for a brand named 'Dragon Group' Futuristic and premium corporate brand identity Primary color palette of neon blue and deep black Secondary accents using subtle electric blue glow A stylized dragon symbol representing strength, leadership, and innovation Modern abstract dragon form, not cartoon or fantasy style Clean flat vector logo suitable for digital and print branding Minimal and bold design with strong visual balance High contrast composition on a dark background Sharp geometric shapes and smooth edges Sleek modern typography integrated with the symbol Technology-driven and enterprise-level aesthetic Elegant and powerful visual tone Neon glow highlights without overpowering the design Centered logo composition, symmetrical and balanced Scalable logo design suitable for websites, apps, and billboards No complex background, logo-focused composition Professional branding mockup quality Ultra high resolution, crisp details High quality, modern logo generation" 
negative_prompt = "low quality, blurry, pixelated, watermark, extra text, cartoon, anime, fantasy illustration, photorealistic, busy background, noisy, distorted, sketch, hand-drawn"

image = pipe(
    prompt=prompt,
    negative_prompt=negative_prompt,
    num_inference_steps=30,
    guidance_scale=7.5
).images[0]

image

# 1. Install missing dependencies (Required every time you restart Kaggle)
!pip install -q pyngrok fastapi uvicorn

import torch
import base64
from io import BytesIO
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pyngrok import ngrok
import uvicorn

# 2. Setup FastAPI
app = FastAPI()

@app.post("/generate")
async def generate(prompt: str):
    try:
        # Generate exactly 2 images using your 'pipe'
        # num_images_per_prompt=2 generates variants simultaneously
        results = pipe(
            prompt, 
            num_images_per_prompt=2, 
            num_inference_steps=30, 
            guidance_scale=7.5,
            width=512, 
            height=512
        ).images
        
        images_base64 = []
        for img in results:
            buffered = BytesIO()
            img.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode()
            images_base64.append(img_str)
        
        return {"images_base64": images_base64}
    except Exception as e:
        print(f"Error generating images: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# 3. Start Ngrok Tunnel
# IMPORTANT: If you have an Ngrok Auth Token, uncomment the line below and add it:
# ngrok.set_auth_token("YOUR_AUTH_TOKEN_HERE")

# Close any existing tunnels to avoid "Too many sessions" error
ngrok.kill()

# Create a new tunnel

ngrok.set_auth_token("3AC4OMDhZggzkUXG1avfWPPNuak_7haVP7CCJQH3cAfUa33Eg")
public_url = ngrok.connect(8000).public_url

# 1. Install nest_asyncio
!pip install -q nest_asyncio

import nest_asyncio
import uvicorn

# 2. Allow nested event loops (Fixes the RuntimeError)
nest_asyncio.apply()

# 3. Print the URL again for clarity
print(f"\n" + "="*50)
print(f"🚀 YOUR AI SERVICE IS LIVE AT:")
print(f"🔗 {public_url}")
print("="*50 + "\n")

# 4. Run the Server
uvicorn.run(app, host="0.0.0.0", port=8000)

import threading
import uvicorn

def run():
    uvicorn.run(app, host="0.0.0.0", port=8000)

thread = threading.Thread(target=run)
thread.start()

!curl http://localhost:8000

from pyngrok import ngrok

ngrok.set_auth_token("3AC4OMDhZggzkUXG1avfWPPNuak_7haVP7CCJQH3cAfUa33Eg")
public_url = ngrok.connect(8000)
print("🌍 Public URL:", public_url)