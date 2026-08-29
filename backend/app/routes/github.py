from fastapi import APIRouter
from app.services.github_app import GitHubAppService
from app.models.github import CreateRepoRequest

router=APIRouter()
service=GitHubAppService()

@router.post("/github/create-repo")
def create_repo(body: CreateRepoRequest):
    return service.create_repository(body.repo_name)
