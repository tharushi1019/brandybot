from pydantic import BaseModel
from typing import List, Optional, Dict, Any

# Logo Generation Models
class LogoRequest(BaseModel):
    brand_name: str
    prompt: str
    style: Optional[str] = "modern"
    industry: Optional[str] = None
    colors: Optional[List[str]] = None

class LogoResponse(BaseModel):
    url: str
    metadata: Dict[str, Any]

# Chat Models
class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = None

class ChatResponse(BaseModel):
    response: str
    sentiment: Optional[str] = None

# Mockup Models
class MockupRequest(BaseModel):
    logo_url: str
    template_type: str
    brand_name: Optional[str] = "Brand"
    primary_color: Optional[str] = "#7C3AED"
    secondary_color: Optional[str] = "#3B82F6"

class MockupResponse(BaseModel):
    url: str
    template_type: str

# Lockup Models
class LockupRequest(BaseModel):
    logo_url: str
    brand_name: str
    tagline: Optional[str] = ""
    layout: Optional[str] = "vertical"
    font_family: Optional[str] = "Inter"
    primary_color: Optional[str] = "#000000"
    secondary_color: Optional[str] = "#666666"
    font_size_name: Optional[int] = 48
    font_size_tagline: Optional[int] = 24
    gap: Optional[int] = 20

class LockupResponse(BaseModel):
    url: str

