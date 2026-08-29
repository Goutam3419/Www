class CoreService125:
    def validate(self, payload: dict):
        return True

    def execute(self, payload: dict):
        return {
            "service": "CoreService125",
            "status": "ok",
            "payload": payload
        }

    def rollback(self):
        return True
