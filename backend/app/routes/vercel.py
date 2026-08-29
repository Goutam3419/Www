from fastapi import APIRouter
from app.services.vercel_agent import VercelAgent
from app.models.vercel import DeployRequest

router=APIRouter()
agent=VercelAgent()

@router.post("/vercel/deploy")
def deploy(body: DeployRequest):
    return agent.deploy(body.repo)

@router.post("/vercel/retry")
def retry():
    return {"status":"qa_retry_ready"}
