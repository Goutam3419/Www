import os

class SupabaseAgent:
    def create_project(self, project_name:str):
        return {
            "status":"ready_for_management_api",
            "project":project_name,
            "org_id":os.getenv("SUPABASE_ORG_ID",""),
            "next":"create project, enable auth, storage and run SQL migrations"
        }
