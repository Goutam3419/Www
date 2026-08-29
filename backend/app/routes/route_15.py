
from fastapi import APIRouter
router=APIRouter()
@router.get("/")
def index():
    return {{"route":"route_15"}}
