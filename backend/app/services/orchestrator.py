class Orchestrator:
    def run(self,prompt:str):
        return {
          "flow":[
            "Planner","Coder","GitHub","Supabase","Vercel","QA"
          ]
        }
