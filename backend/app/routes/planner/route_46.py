from fastapi import APIRouter
router=APIRouter()
@router.post("/plan")
def plan():
    return {"status":"planner-ready"}
