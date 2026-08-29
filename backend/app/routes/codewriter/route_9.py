
from fastapi import APIRouter
router=APIRouter()
@router.post("/write")
def write():
    return {"status":"writer-ready"}
