from pydantic import BaseModel

class CreateRepoRequest(BaseModel):
    repo_name:str
