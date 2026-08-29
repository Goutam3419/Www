class StreamService5:
    def enqueue(self,prompt:str):
        return {"status":"queued","prompt":prompt}
    def stream(self):
        return True
