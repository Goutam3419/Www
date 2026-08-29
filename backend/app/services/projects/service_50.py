class ProjectService50:
    def save(self,payload:dict):
        return {"status":"saved","payload":payload}
    def load(self):
        return {"status":"loaded"}
