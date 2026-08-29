from fastapi import FastAPI
from app.routes.planner import router
app=FastAPI(title="AI Builder v4")
app.include_router(router,prefix="/api")
