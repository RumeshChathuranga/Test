from .connection import get_db_cursor

class DBError(Exception): ...

def call_proc(proc_name: str, args: tuple = ()):
    with get_db_cursor() as (conn, cur):
        try:
            cur.callproc(proc_name, args)
            # collect first resultset if any
            for rs in cur.stored_results():
                rows = rs.fetchall()
                conn.commit()
                return rows
            conn.commit()
            return None
        except Exception as e:
            conn.rollback()
            raise DBError(f"{proc_name} failed: {e}") from e
