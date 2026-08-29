class PlannerService85:
    def analyze(self,prompt:str):
        return {"status":"planned","prompt":prompt}
    def build_tasks(self):
        return ["design","code","deploy"]
