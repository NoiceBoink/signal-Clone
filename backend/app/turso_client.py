"""
Turso / libSQL Cloud Database Client
Provides an async SQLite-compatible adapter layer over libsql-client for Turso Cloud.
"""

import os
import logging
from typing import Any, List, Optional, Sequence, Union
import libsql_client

logger = logging.getLogger(__name__)


def is_turso_configured() -> bool:
    """Check if Turso database credentials are provided in environment."""
    url = os.getenv("TURSO_DATABASE_URL", "").strip()
    token = os.getenv("TURSO_AUTH_TOKEN", "").strip()
    return bool(url and token)


def get_turso_url() -> str:
    """Retrieve Turso database URL."""
    return os.getenv("TURSO_DATABASE_URL", "").strip()


def get_turso_token() -> str:
    """Retrieve Turso database auth token."""
    return os.getenv("TURSO_AUTH_TOKEN", "").strip()


class TursoRow(dict):
    """
    Dictionary subclass that also allows integer index lookups (e.g. row[0]),
    matching the dual-access behavior of aiosqlite.Row / sqlite3.Row.
    """

    def __init__(self, columns: Sequence[str], values: Sequence[Any]):
        super().__init__(zip(columns, values))
        self._columns = tuple(columns)
        self._values = tuple(values)

    def __getitem__(self, key: Union[str, int]) -> Any:
        if isinstance(key, int):
            return self._values[key]
        return super().__getitem__(key)

    def keys(self):
        return self._columns

    def values(self):
        return self._values


class TursoCursor:
    """Async cursor adapter wrapping libsql_client.ResultSet."""

    def __init__(self, result_set: Optional[libsql_client.ResultSet]):
        if result_set is not None and hasattr(result_set, "rows"):
            cols = result_set.columns or ()
            self._rows = [TursoRow(cols, r) for r in result_set.rows]
            self.lastrowid = getattr(result_set, "last_insert_rowid", None)
            self.rowcount = getattr(result_set, "rows_affected", len(self._rows))
        else:
            self._rows = []
            self.lastrowid = None
            self.rowcount = 0
        self._index = 0

    async def fetchone(self) -> Optional[TursoRow]:
        if self._index < len(self._rows):
            row = self._rows[self._index]
            self._index += 1
            return row
        return None

    async def fetchall(self) -> List[TursoRow]:
        remaining = self._rows[self._index:]
        self._index = len(self._rows)
        return remaining

    def __iter__(self):
        return iter(self._rows)

    def __len__(self):
        return len(self._rows)


class TursoConnection:
    """Async connection adapter wrapping libsql_client.Client."""

    def __init__(self, client: libsql_client.Client):
        self._client = client

    async def execute(self, sql: str, params: Optional[Any] = None) -> TursoCursor:
        """Execute a SQL statement with optional positional parameters."""
        if params is None:
            res = await self._client.execute(sql)
        else:
            p_list = list(params) if isinstance(params, (tuple, list)) else params
            res = await self._client.execute(sql, p_list)
        return TursoCursor(res)

    async def executemany(self, sql: str, seq_of_params: Sequence[Any]) -> List[TursoCursor]:
        """Execute multiple parameterized SQL statements in sequence."""
        cursors = []
        for p in seq_of_params:
            cur = await self.execute(sql, p)
            cursors.append(cur)
        return cursors

    async def commit(self) -> None:
        """Commit transaction. libSQL HTTP statements autocommit per request."""
        pass

    async def close(self) -> None:
        """Close connection."""
        await self._client.close()


def create_turso_client() -> libsql_client.Client:
    """Create a new libsql_client.Client configured with Turso URL and token."""
    url = get_turso_url()
    token = get_turso_token()
    if not url or not token:
        raise ValueError("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be configured.")
    return libsql_client.create_client(url=url, auth_token=token)


async def get_turso_connection() -> TursoConnection:
    """Create and return a TursoConnection adapter."""
    client = create_turso_client()
    return TursoConnection(client)
