from fastapi import APIRouter, HTTPException
from fastapi.staticfiles import StaticFiles
from models import LogoRequest, LogoResponse, ChatRequest, ChatResponse, MockupRequest, MockupResponse
import time
import os
import uuid
from image_client import generate_image_pollinations
from mockup_engine import generate_mockup, TEMPLATES

router = APIRouter()

# Ensure static directory exists
STATIC_DIR = "static"
os.makedirs(STATIC_DIR, exist_ok=True)

# Base URL for serving static mockup images
AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://localhost:8000")

# ---------------------------------------------------------
# Logo Generation Endpoint
# ---------------------------------------------------------
@router.post("/generate/logo", response_model=LogoResponse)
async def generate_logo(request: LogoRequest):
    print(f"🎨 Generating Logo for: {request.brand_name} ({request.style})")
    
    try:
        # Use the prompt directly if it's a full SD prompt, else build a basic one
        if request.prompt and len(request.prompt) > 80:
            prompt = request.prompt  # Full 50-line SD prompt from LLM
        else:
            prompt = f"professional logo for {request.brand_name}, {request.style or 'modern'}, vector graphics, flat design, white background, minimal, high quality"
        
        # Call Pollinations.ai (Free)
        image_bytes = generate_image_pollinations(prompt)
        
        # Save image locally
        filename = f"logo_{uuid.uuid4()}.png"
        filepath = os.path.join(STATIC_DIR, filename)
        
        with open(filepath, "wb") as f:
            f.write(image_bytes)

        image_url = f"{AI_SERVICE_URL}/static/{filename}"
        
        return LogoResponse(
            url=image_url,
            metadata={
                "width": 512,
                "height": 512,
                "generated_by": "pollinations-sd",
                "seed": 0,
                "prompt_length": len(prompt)
            }
        )
        
    except Exception as e:
        print(f"❌ Generation Failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------
# Chat Endpoint (Compatibility stub — logic moved to Node)
# ---------------------------------------------------------
@router.post("/generate/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    return ChatResponse(
        response="Please use the Node.js backend /api/chat for AI chat functionality.",
        sentiment="neutral"
    )


# ---------------------------------------------------------
# Mockup Generation Endpoint — Real Pillow Compositing
# ---------------------------------------------------------
@router.post("/generate/mockup", response_model=MockupResponse)
async def generate_mockup_endpoint(request: MockupRequest):
    print(f"👕 Generating Mockup: {request.template_type} for '{request.brand_name}'")

    if request.template_type not in TEMPLATES:
        valid = ", ".join(TEMPLATES.keys())
        raise HTTPException(
            status_code=400,
            detail=f"Invalid template_type '{request.template_type}'. Valid options: {valid}"
        )

    try:
        filepath, filename = generate_mockup(
            logo_url=request.logo_url,
            template_type=request.template_type,
            brand_name=request.brand_name or "Brand",
            primary_color=request.primary_color or "#7C3AED",
            secondary_color=request.secondary_color or "#3B82F6"
        )

        mockup_url = f"{AI_SERVICE_URL}/static/{filename}"
        print(f"✅ Mockup saved: {filepath}")

        return MockupResponse(url=mockup_url, template_type=request.template_type)

    except Exception as e:
        print(f"❌ Mockup Failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Mockup generation failed: {str(e)}"
        )

