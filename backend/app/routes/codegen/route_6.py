from fastapi import APIRouter
router=APIRouter()
@router.post("/assemble")
def assemble():
    return {"status":"ready"}
