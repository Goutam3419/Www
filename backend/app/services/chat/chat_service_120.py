
class ChatService120:
    def process(self,prompt):
        return {"status":"queued","prompt":prompt}
    def stream(self):
        return True
