from fastapi import APIRouter
router=APIRouter()
@router.post("/project")
def project():
    return {"status":"supabase-ready"}
