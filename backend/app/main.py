from fastapi import FastAPI
from app.routes.chat import router as chat
app=FastAPI(title="AI Builder Final")
app.include_router(chat,prefix="/api")
@app.get("/health")
def health():
    return {"status":"ok","version":"final"}
