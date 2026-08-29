from fastapi import FastAPI
from app.routes.chat import router
app=FastAPI(title="AI Builder v3")
app.include_router(router,prefix="/api")
