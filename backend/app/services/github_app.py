import os

class GitHubAppService:
    def create_repository(self, repo_name:str):
        return {
            "status":"ready_for_github_api",
            "repo":repo_name,
            "installation_id":os.getenv("GITHUB_INSTALLATION_ID",""),
            "next":"create repo via GitHub App REST API and commit generated files"
        }
