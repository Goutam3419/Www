from fastapi import FastAPI
app=FastAPI(title="AI Builder R1")
@app.get("/health")
def health(): return {"status":"ok"}