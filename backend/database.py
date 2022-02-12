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
        self.cursor.close()
        self.connection.commit()
        with poolLock:
            pool.append(self.connection)
        poolSemaphore.release()
