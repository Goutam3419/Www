
from fastapi import APIRouter
router=APIRouter()
@router.post("/layout")
def layout():
    return {"status":"layout-ready"}
