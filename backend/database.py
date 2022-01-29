import mysql.connector


class DbConnection:
    def __init__(self, host, user, password, dbName):
        self.host = host
        self.user = user
        self.password = password
        self.dbName = dbName
        self.connection = None
        self.cursor = None

    def __enter__(self):
        self.connection = mysql.connector.connect(
            host=self.host,
            user=self.user,
            password=self.password,
            database=self.dbName
        )
        self.cursor = self.connection.cursor()
        return self.cursor

    def __exit__(self, type, value, traceback):
        self.cursor.close()
        self.connection.close()

    def commit(self):
        self.connection.commit()


dbConnection = DbConnection(
            "tbuli12.mysql.pythonanywhere-services.com",
            "tbuli12",
            "livjmos35",
            "tbuli12$kitchen"
        )