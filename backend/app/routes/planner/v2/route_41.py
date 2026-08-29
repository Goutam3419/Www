
from fastapi import APIRouter
router=APIRouter()
@router.post("/blueprint")
def blueprint():
    return {"status":"blueprint-ready"}
