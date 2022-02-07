import mysql.connector
from threading import Lock, Semaphore

POOL_SIZE = 5
poolLock = Lock()
poolSemaphore = Semaphore(POOL_SIZE)
pool = None

def init():
    with poolLock:
        global pool
        pool = [mysql.connector.connect(
            "tbuli12.mysql.pythonanywhere-services.com",
            "tbuli12",
            "livjmos35",
            "tbuli12$kitchen"
        ) for i in range(POOL_SIZE)]

def close():
    with poolLock:
        global pool
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
