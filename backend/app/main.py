from fastapi import FastAPI
from app.routes.vercel import router as vercel_router

app=FastAPI(title="AI Builder v9")
app.include_router(vercel_router,prefix="/api")

@app.get("/health")
def health():
    return {"status":"ok","version":"v9"}
