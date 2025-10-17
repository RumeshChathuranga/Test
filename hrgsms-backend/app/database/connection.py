from mysql.connector import pooling, Error
from ..config import settings

# Global pool variable
pool = None

def get_connection_pool():
    """Lazy-load the connection pool"""
    global pool
    if pool is None:
        try:
            pool = pooling.MySQLConnectionPool(
                pool_name="hrgsms_pool",
                pool_size=10,
                pool_reset_session=True,
                host=settings.DB_HOST,
                port=settings.DB_PORT,
                user=settings.DB_USER,
                password=settings.DB_PASSWORD,
                database=settings.DB_NAME,
            )
        except Error as e:
            raise DBError(f"Failed to create connection pool: {e}") from e
    return pool

class DBError(RuntimeError):
    pass

class get_db_cursor:
    """Context manager that yields a (conn, cursor) pair and ensures cleanup."""
    def __enter__(self):
        try:
            connection_pool = get_connection_pool()
            self.conn = connection_pool.get_connection()
            self.cursor = self.conn.cursor(dictionary=True)
            return self.conn, self.cursor
        except Error as e:
            raise DBError(f"DB connection error: {e}") from e

    def __exit__(self, exc_type, exc, tb):
        try:
            if exc:
                self.conn.rollback()
            else:
                self.conn.commit()
        finally:
            try:
                if hasattr(self, 'cursor') and self.cursor:
                    self.cursor.close()
            finally:
                if hasattr(self, 'conn') and self.conn:
                    self.conn.close()
