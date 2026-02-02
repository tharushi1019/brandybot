from fastapi import APIRouter, HTTPException
from models import LogoRequest, LogoResponse, ChatRequest, ChatResponse, MockupRequest, MockupResponse
import time
import random

router = APIRouter()

# ---------------------------------------------------------
# Logo Generation Endpoint
# ---------------------------------------------------------
@router.post("/generate/logo", response_model=LogoResponse)
async def generate_logo(request: LogoRequest):
    print(f"🎨 Generating Logo for: {request.brand_name} ({request.style})")
    
    # Simulate processing time
    time.sleep(2)
    
    # Mock Response (In real impl, call Stable Diffusion API here)
    mock_url = f"https://via.placeholder.com/1024x1024.png?text={request.brand_name}+{request.style}"
    
    return LogoResponse(
        url=mock_url,
        metadata={
            "width": 1024,
            "height": 1024,
            "generated_by": "brandybot-sd-v1",
            "seed": 123456
        }
    )

# ---------------------------------------------------------
# Chat Endpoint
# ---------------------------------------------------------
@router.post("/generate/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    print(f"💬 Chat message: {request.message}")
    
    # Simulate processing time
    time.sleep(1)
    
    # Mock Logic
    responses = [
        "That's an interesting direction for your brand.",
        "I suggest using a serif font to convey more authority.",
        "Blue and Gold usually work well for finance companies.",
        "Could you tell me more about your competitors?"
    ]
    
    return ChatResponse(
        response=random.choice(responses),
        sentiment="neutral"
    )

# ---------------------------------------------------------
# Mockup Endpoint
# ---------------------------------------------------------
@router.post("/generate/mockup", response_model=MockupResponse)
async def generate_mockup(request: MockupRequest):
    print(f"👕 Generating Mockup: {request.template_type}")
    
    time.sleep(1.5)
    
    mock_url = f"https://via.placeholder.com/800x600.png?text=Mockup+{request.template_type}"
    
    return MockupResponse(
        url=mock_url
    )
