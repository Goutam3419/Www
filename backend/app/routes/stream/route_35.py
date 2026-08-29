from fastapi import APIRouter
router=APIRouter()
@router.get("/events")
def events():
    return {"status":"stream-ready"}
