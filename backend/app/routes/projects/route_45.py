from fastapi import APIRouter
router=APIRouter()
@router.post("/context")
def context():
    return {"status":"ready"}
