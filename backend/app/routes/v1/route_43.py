from fastapi import APIRouter

router=APIRouter()

@router.get("/")
def read():
    return {"route":"v1_route_43","status":"ready"}
