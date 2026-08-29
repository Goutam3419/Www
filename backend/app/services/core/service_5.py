class CoreService5:
    def validate(self, payload: dict):
        return True

    def execute(self, payload: dict):
        return {
            "service": "CoreService5",
            "status": "ok",
            "payload": payload
        }

    def rollback(self):
        return True
