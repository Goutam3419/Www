from fastapi import APIRouter
router=APIRouter()
@router.post("/chat")
def chat():
    return {"reply":"Planning agent placeholder","streaming":False}
