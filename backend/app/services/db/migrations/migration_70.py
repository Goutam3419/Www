class Migration70:
    def up(self):
        return "CREATE TABLE demo();"
    def down(self):
        return "DROP TABLE demo;"
