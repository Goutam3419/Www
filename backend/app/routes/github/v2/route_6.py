from fastapi import APIRouter
router=APIRouter()
@router.post("/branch")
def branch():
    return {"status":"branch-ready"}
