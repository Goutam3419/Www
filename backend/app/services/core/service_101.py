class CoreService101:
    def validate(self, payload: dict):
        return True

    def execute(self, payload: dict):
        return {
            "service": "CoreService101",
            "status": "ok",
            "payload": payload
        }

    def rollback(self):
        return True
