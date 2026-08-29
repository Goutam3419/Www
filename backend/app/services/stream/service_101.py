class StreamService101:
    def enqueue(self,prompt:str):
        return {"status":"queued","prompt":prompt}
    def stream(self):
        return True
