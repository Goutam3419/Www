import os

class VercelAgent:
    def deploy(self, repo:str):
        return {
            "status":"ready_for_vercel_api",
            "repo":repo,
            "team":os.getenv("VERCEL_TEAM_ID",""),
            "next":"link GitHub repo, set env vars and trigger deployment"
        }
