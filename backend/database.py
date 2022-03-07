import mysql.connector
from threading import Lock, Semaphore

POOL_SIZE = 2
poolLock = Lock()
poolSemaphore = Semaphore(POOL_SIZE)
pool = None

def init():
    global pool
    with poolLock:
        pool = [mysql.connector.connect(
            host="tbuli12.mysql.pythonanywhere-services.com",
            user="tbuli12",
            password="livjmos35",
            database="tbuli12$kitchen"
        ) for i in range(POOL_SIZE)]

def close():
    global pool
    with poolLock:
        for c in pool:
            c.close()


class DbCursor:
    def __enter__(self):
        poolSemaphore.acquire()
        with poolLock:
            self.connection = pool.pop()
        self.cursor = self.connection.cursor()
        return self.cursor

    def __exit__(self, type, value, traceback):
        self.connection.commit()
        with poolLock:
            pool.append(self.connection)
        poolSemaphore.release()

class RemoteArray:
    def __init__(self, name, user, columns, colNames):
        self.name = name
        self.columns = columns
        self.colNames = colNames
        self.user = user
        self.idTable = dict()
    
    def getId(self, id):
        if id < 0:
            return self.idTable[id]
        return id
    
    def fetch(self):
        with DbCursor() as cursor:
            cursor.execute(f"select {', '.join(self.columns)} from {self.name} where user_id = {self.user}")
            rows = cursor.fetchall()
        return [
            dict(zip(self.colNames, row))
            for row in rows
        ]
    
    def delete(self, cursor, id):
        cursor.execute(f"delete from {self.name} where {self.columns[0]} = %s and user_id = %s", (self.getId(id), self.user))

    def update(self, cursor, id, vals):
        valsArg = []
        keysArg = []
        for i in range(len(self.columns)):
            if self.colNames[i] in vals:
                valsArg.append(vals[self.colNames[i]])
                keysArg.append(self.columns[i])
        cursor.execute(f"update {self.name} set {', '.join(f'{k} = %s' for k in keysArg)} where {self.columns[0]} = %s and user_id = %s",
            (*valsArg, self.getId(id), self.user)
        )

    def add(self, cursor, vals):
        id = vals["id"]
        del vals["id"]
        cursor.execute(f"insert into {self.name} ({', '.join(self.columns[1:])}, user_id) values ({', '.join('%s' for _ in range(len(self.columns)-1))}, %s)",
            (*[vals[k] for k in self.colNames[1:]], self.user)
        )
        self.idTable[id] = cursor.lastrowid

    def push(self, actions):
        with DbCursor() as cursor:
            for action in actions:
                name = action["action"]
                if name == "add":
                    self.add(cursor, action["values"])
                elif name == "delete":
                    self.delete(cursor, action["id"])
                elif name == "update":
                    self.update(cursor, action["id"], action["values"])
