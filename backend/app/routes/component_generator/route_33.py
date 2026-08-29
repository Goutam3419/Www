from fastapi import APIRouter
router=APIRouter()
@router.post("/preview")
def preview():
    return {"status":"preview-ready"}
