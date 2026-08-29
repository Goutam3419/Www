from fastapi import APIRouter
from app.services.gemini import ask_gemini
router=APIRouter()
@router.post("/chat")
def chat(body:dict):
    prompt=body.get("prompt","")
    return {"reply":ask_gemini(prompt)}
