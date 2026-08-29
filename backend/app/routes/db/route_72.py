from fastapi import APIRouter
router=APIRouter()
@router.post("/migrate")
def migrate():
    return {"status":"migration-ready"}
