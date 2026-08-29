from fastapi import FastAPI
from app.routes.coder import router
app=FastAPI(title="AI Builder v6")
app.include_router(router,prefix="/api")
