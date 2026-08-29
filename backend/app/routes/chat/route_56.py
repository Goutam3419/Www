
from fastapi import APIRouter
router=APIRouter()
@router.post("/stream")
def stream():
    return {"status":"ready"}
