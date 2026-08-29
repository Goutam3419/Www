class StreamService2:
    def enqueue(self,prompt:str):
        return {"status":"queued","prompt":prompt}
    def stream(self):
        return True
