
from fastapi import APIRouter
router=APIRouter()
@router.post("/login")
def login():
    return {"status":"ready"}
@router.post("/signup")
def signup():
    return {"status":"ready"}
