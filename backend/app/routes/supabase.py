from fastapi import APIRouter
from app.services.supabase_agent import SupabaseAgent
from app.models.supabase import ProjectRequest

router=APIRouter()
agent=SupabaseAgent()

@router.post("/supabase/create-project")
def create_project(body: ProjectRequest):
    return agent.create_project(body.project_name)

@router.post("/supabase/run-sql")
def run_sql():
    return {"status":"ready_for_sql_migrations"}
