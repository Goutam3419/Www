from fastapi import APIRouter
router=APIRouter()
@router.post("/push")
def push():
    return {"status":"github-ready"}
