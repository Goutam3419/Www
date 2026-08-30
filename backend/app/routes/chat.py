from fastapi import APIRouter
from app.services.gemini_service import ask
router=APIRouter()
@router.post("/chat")
def chat(body:dict):
    return {"reply":ask(body.get("message",""))}
