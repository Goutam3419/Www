from fastapi import FastAPI
from app.routes.github import router as github_router
app=FastAPI(title="AI Builder v7")
app.include_router(github_router,prefix="/api")
@app.get("/health")
def health():
    return {"status":"ok","version":"v7"}
