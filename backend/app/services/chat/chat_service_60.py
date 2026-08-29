
class ChatService60:
    def process(self,prompt):
        return {"status":"queued","prompt":prompt}
    def stream(self):
        return True
