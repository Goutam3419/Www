from fastapi import FastAPI
from app.routes.github import router
app=FastAPI(title="AI Builder v5")
app.include_router(router,prefix="/api")
