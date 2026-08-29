from fastapi import FastAPI
from app.routes.chat import router as chat_router
app=FastAPI(title="AI Builder Backend v2")
app.include_router(chat_router,prefix="/api")
@app.get("/health")
def health():
    return {"status":"ok","version":"v2"}
