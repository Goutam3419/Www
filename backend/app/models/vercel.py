from pydantic import BaseModel

class DeployRequest(BaseModel):
    repo:str
