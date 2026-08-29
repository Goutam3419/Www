from fastapi import FastAPI
from app.routes.supabase import router as supabase_router
app=FastAPI(title="AI Builder v8")
app.include_router(supabase_router,prefix="/api")
@app.get("/health")
def health():
    return {"status":"ok","version":"v8"}
