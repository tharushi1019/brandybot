# BrandyBot AI Service - SDXL with ngrok on Kaggle
# ===================================================

# 1. Install Dependencies
!pip install -q diffusers transformers accelerate fastapi uvicorn pyngrok nest-asyncio python-multipart pydantic

# 2. Import Libraries
import torch
from diffusers import AutoPipelineForText2Image
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import nest_asyncio
from pyngrok import ngrok
import base64
from io import BytesIO
import uuid
import time

# 3. NGROK Configuration (YOUR TOKEN)
NGROK_AUTH_TOKEN = "3AC4U6xOI73bNT2uNbmbMpetXHB_6Dd2hbCJqAaYMjJxjkTgR"

# 4. Load SDXL Model
print("Loading SDXL Model... (This takes a minute)")
pipe = AutoPipelineForText2Image.from_pretrained(
    "stabilityai/sdxl-turbo", 
    torch_dtype=torch.float16, 
    variant="fp16"
)
pipe.to("cuda")
print("Model Loaded successfully!")

# 5. Initialize FastAPI App
app = FastAPI(title="BrandyBot AI Service - Kaggle")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# ROUTES
# ---------------------------------------------------------

@app.get("/")
def home():
    return {"status": "SDXL API running"}

# The Node Backend sends a POST request with this structure
class LogoRequest(BaseModel):
    brand_name: str
    industry: str
    style: str
    prompt: str

@app.post("/api/v1/generate/logo")
async def generate_logo(request: LogoRequest):
    print(f"Generating logo for: {request.brand_name} ({request.industry})")
    print(f"Prompt: {request.prompt}")
    
    try:
        # Generate the image 
        # (Using SDXL-Turbo, so num_inference_steps can be low, e.g., 2)
        image = pipe(request.prompt, num_inference_steps=2, guidance_scale=0.0).images[0]
        
        # Convert PIL Image to Base64 String format
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
        data_url = f"data:image/png;base64,{img_str}"
        
        # This matches EXACTLY what the BrandyBot Backend expects to receive!
        return {
            "url": data_url,
            "metadata": {
                "width": image.width,
                "height": image.height,
                "generated_by": "sdxl-kaggle"
            }
        }
        
    except Exception as e:
        print(f"Error generating image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 6. Start ngrok and Uvicorn server
ngrok.set_auth_token(NGROK_AUTH_TOKEN)
public_url = ngrok.connect(8000).public_url

print("=" * 60)
print(f"🚀 PUBLIC API URL: {public_url}")
print("COPY THIS URL AND ADD IT TO YOUR BACKEND .ENV AS AI_SERVICE_URL")
print("=" * 60)

nest_asyncio.apply()
uvicorn.run(app, host="0.0.0.0", port=8000)
