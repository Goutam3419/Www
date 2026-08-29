
class AuthService1:
    def login(self,email,password):
        return {"status":"ready","email":email}
    def signup(self,email,password):
        return {"status":"ready","email":email}
    def refresh(self):
        return True
