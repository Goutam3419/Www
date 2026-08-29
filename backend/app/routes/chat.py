from fastapi import APIRouter
router=APIRouter()
@router.post("/chat")
def chat():
    return {"message":"Gemini integration foundation ready"}
