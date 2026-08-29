
from fastapi import APIRouter
router=APIRouter()
@router.post("/merge")
def merge():
    return {"status":"merge-ready"}
