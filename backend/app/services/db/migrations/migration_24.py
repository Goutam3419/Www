class Migration24:
    def up(self):
        return "CREATE TABLE demo();"
    def down(self):
        return "DROP TABLE demo;"
