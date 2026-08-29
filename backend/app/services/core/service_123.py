class CoreService123:
    def validate(self, payload: dict):
        return True

    def execute(self, payload: dict):
        return {
            "service": "CoreService123",
            "status": "ok",
            "payload": payload
        }

    def rollback(self):
        return True
