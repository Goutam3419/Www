from fastapi import APIRouter

router=APIRouter()

@router.get("/")
def read():
    return {"route":"v1_route_29","status":"ready"}
