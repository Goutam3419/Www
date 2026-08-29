from fastapi import FastAPI
app=FastAPI(title="AI Builder R2")
@app.get("/health")
def h(): return {"status":"ok"}
