from fastapi import APIRouter
router=APIRouter()

@router.post("/plan")
def plan():
    return {
        "project":"coffee-shop",
        "pages":["Home","Menu","About","Contact","Booking"],
        "status":"planned"
    }
