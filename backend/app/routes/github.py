from fastapi import APIRouter
router=APIRouter()

@router.post("/github/repo")
def create_repo():
    return {"status":"foundation","next":"GitHub App integration in v6"}
