from fastapi import APIRouter, HTTPException
from fastapi.staticfiles import StaticFiles
from models import LogoRequest, LogoResponse, ChatRequest, ChatResponse, MockupRequest, MockupResponse
import time
import random
import os
import uuid
# from hf_client import generate_image_hf 
from image_client import generate_image_pollinations

router = APIRouter()

# Ensure static directory exists
STATIC_DIR = "static"
os.makedirs(STATIC_DIR, exist_ok=True)

# ---------------------------------------------------------
# Logo Generation Endpoint
# ---------------------------------------------------------
@router.post("/generate/logo", response_model=LogoResponse)
async def generate_logo(request: LogoRequest):
    print(f"🎨 Generating Logo for: {request.brand_name} ({request.style})")
    
    try:
        # Construct a prompt
        prompt = f"logo for {request.brand_name}, {request.style}, vector graphics, flat design, white background, high quality, professional"
        
        # Call Pollinations.ai (Free)
        image_bytes = generate_image_pollinations(prompt)
        
        # Save image locally
        filename = f"logo_{uuid.uuid4()}.png"
        filepath = os.path.join(STATIC_DIR, filename)
        
        with open(filepath, "wb") as f:
            f.write(image_bytes)
            
        # Construct local URL (Assuming service runs on localhost:8000)
        # In production, this should be a cloud storage URL
        image_url = f"http://localhost:8000/static/{filename}"
        
        return LogoResponse(
            url=image_url,
            metadata={
                "width": 512, # SD 2.1 default
                "height": 512,
                "generated_by": "stable-diffusion-2-1",
                "seed": 0 # We don't control seed in simple API
            }
        )
        
    except Exception as e:
        print(f"❌ Generation Failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------------------------------------
# Chat Endpoint (Mock - Handled by Node Backend now, but kept for compatibility)
# ---------------------------------------------------------
@router.post("/generate/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    print(f"💬 Chat message: {request.message}")
    
    # Simulate processing time
    time.sleep(1)
    
    return ChatResponse(
        response="I am the AI Service. Please chat with the Node Backend directly for intelligence!",
        sentiment="neutral"
    )

# ---------------------------------------------------------
# Mockup Endpoint (Mock)
# ---------------------------------------------------------
@router.post("/generate/mockup", response_model=MockupResponse)
async def generate_mockup(request: MockupRequest):
    print(f"👕 Generating Mockup: {request.template_type}")
    
    time.sleep(1.5)
    
    mock_url = f"https://via.placeholder.com/800x600.png?text=Mockup+{request.template_type}"
    
    return MockupResponse(
        url=mock_url
    )
