from pydantic import BaseModel

class ProjectRequest(BaseModel):
    project_name:str
