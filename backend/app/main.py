from fastapi import FastAPI

app = FastAPI(title="AI Builder Backend")

@app.get("/")
def root():
    return {"status":"ok","phase":"v1"}
