from dataclasses import dataclass
import datetime
import logging
import sqlite3
from typing import List, Dict

from python.db.sqlite_db import SqlLiteDb

logger = logging.getLogger()


@dataclass
class GameTimeDto:
    game_id: str
    game_name: str
    time: int


@dataclass
class DailyGameTimeDto:
    date: str
    game_id: str
    game_name: str
    time: int
    sessions: int


@dataclass
class SessionInformation:
    date: str
    duration: float
    migrated: str | None


@dataclass
class OverallGamesTimeDto:
    game_id: str
    game_name: str
    last_play_duration_time: float
    last_play_time_date: str
    time: int
    total_sessions: int


@dataclass
class GameInformationDto:
    game_id: str
    name: str
    time: float


@dataclass
class FileChecksum:
    hash_id: int
    checksum: str
    algorithm: str
    chunk_size: int
    created_at: None | str
    updated_at: None | str


@dataclass
class GameDictionary:
    id: str
    name: str


class Dao:
    def __init__(self, db: SqlLiteDb):
        self._db = db

    def save_game_dict(self, game_id: str, game_name: str) -> None:
        connection: sqlite3.Connection

        with self._db.transactional() as connection:
            self._save_game_dict(connection, game_id, game_name)

    def save_play_time(
        self,
        start: datetime.datetime,
        time_s: int,
        game_id: str,
        source: str | None = None,
    ) -> None:
        with self._db.transactional() as connection:
            self._save_play_time(connection, start, time_s, game_id, source)

    def apply_manual_time_for_game(
        self,
        create_at: datetime.datetime,
        game_id: str,
        game_name: str,
        new_overall_time: float,
        source: str,
    ) -> None:
        with self._db.transactional() as connection:
            self._save_game_dict(connection, game_id, game_name)
            current_time = connection.execute(
                "SELECT sum(duration) FROM play_time WHERE game_id = ?", (game_id,)
            ).fetchone()[0]
            delta_time = new_overall_time - (
                current_time if current_time is not None else 0
            )
            if delta_time != 0:
                self._save_play_time(connection, create_at, delta_time, game_id, source)

    def fetch_per_day_time_report(
        self,
        begin: datetime.datetime,
        end: datetime.datetime,
        game_id: str | None = None,
    ) -> List[DailyGameTimeDto]:
        with self._db.transactional() as connection:
            return self._fetch_per_day_time_report(connection, begin, end, game_id)

    def is_there_is_data_before(
        self, date: datetime.datetime, game_id: str | None = None
    ) -> bool:
        with self._db.transactional() as connection:
            return self._is_there_is_data_before(connection, date, game_id)

    def is_there_is_data_after(
        self, date: datetime.datetime, game_id: str | None = None
    ) -> bool:
        with self._db.transactional() as connection:
            return self._is_there_is_data_after(connection, date, game_id)

    def _is_there_is_data_before(
        self,
        connection: sqlite3.Connection,
        date: datetime.datetime,
        game_id: str | None = None,
    ) -> bool:
        if game_id:
            return (
                connection.execute(
                    """
                SELECT count(1) FROM play_time pt
                WHERE date_time < ? AND pt.game_id = ?
            """,
                    (
                        date.isoformat(),
                        game_id,
                    ),
                ).fetchone()[0]
                > 0
            )

        return (
            connection.execute(
                """
                SELECT count(1) FROM play_time
                WHERE date_time < ?
            """,
                (date.isoformat(),),
            ).fetchone()[0]
            > 0
        )

    def _is_there_is_data_after(
        self,
        connection: sqlite3.Connection,
        date: datetime.datetime,
        game_id: str | None = None,
    ) -> bool:
        if game_id:
            return (
                connection.execute(
                    """
                SELECT count(1) FROM play_time pt
                WHERE date_time > ? AND pt.game_id = ?
            """,
                    (
                        date.isoformat(),
                        game_id,
                    ),
                ).fetchone()[0]
                > 0
            )

        return (
            connection.execute(
                """
                SELECT count(1) FROM play_time
                WHERE date_time > ?
            """,
                (date.isoformat(),),
            ).fetchone()[0]
            > 0
        )

    def _save_game_dict(
        self, connection: sqlite3.Connection, game_id: str, game_name: str
    ):
        connection.execute(
            """
                INSERT INTO game_dict (game_id, name)
                VALUES (:game_id, :game_name)
                ON CONFLICT (game_id) DO UPDATE SET name = :game_name
                WHERE name != :game_name
                """,
            {"game_id": game_id, "game_name": game_name},
        )

    def fetch_overall_playtime(self) -> List[OverallGamesTimeDto]:
        with self._db.transactional() as connection:
            return self._fetch_overall_playtime(connection)

    def _save_play_time(
        self,
        connection: sqlite3.Connection,
        start: datetime.datetime,
        time_s: float,
        game_id: str,
        source: str | None = None,
    ):
        connection.execute(
            """
                INSERT INTO play_time(date_time, duration, game_id, migrated)
                VALUES (?,?,?,?)
                """,
            (start.isoformat(), time_s, game_id, source),
        )
        self._append_overall_time(connection, game_id, time_s)

    # TODO: Add `_remove_play_time`

    def _append_overall_time(
        self, connection: sqlite3.Connection, game_id: str, delta_time_s: float
    ):
        connection.execute(
            """
                INSERT INTO overall_time (game_id, duration)
                VALUES (:game_id, :delta_time_s)
                ON CONFLICT (game_id)
                    DO UPDATE SET duration = duration + :delta_time_s
            """,
            {"game_id": game_id, "delta_time_s": delta_time_s},
        )

    def _fetch_overall_playtime(
        self,
        connection: sqlite3.Connection,
    ) -> List[OverallGamesTimeDto]:
        connection.row_factory = lambda c, row: GameTimeDto(
            game_id=row[0],
            game_name=row[1],
            time=row[2],
        )

        return connection.execute(
            """
                SELECT
                    ot.game_id,
                    gd.name AS game_name,
                    ot.duration
                FROM
                    overall_time ot
                JOIN 
                    game_dict gd
                ON
                    ot.game_id = gd.game_id;
            """
        ).fetchall()

    def _fetch_per_day_time_report(
        self,
        connection: sqlite3.Connection,
        begin: datetime.datetime,
        end: datetime.datetime,
        game_id: str | None = None,
    ) -> List[DailyGameTimeDto]:
        connection.row_factory = lambda c, row: DailyGameTimeDto(
            date=row[0], game_id=row[1], game_name=row[2], time=row[3], sessions=row[4]
        )

        if game_id:
            return connection.execute(
                """
                SELECT STRFTIME('%Y-%m-%d', STRFTIME('%s', date_time), 'unixepoch') as date,
                    pt.game_id as game_id,
                    gd.name as game_name,
                    SUM(duration) as total_time,
                    COUNT(pt.game_id) AS sessions
                FROM play_time pt
                        LEFT JOIN game_dict gd ON pt.game_id = gd.game_id
                WHERE STRFTIME('%s', date_time) BETWEEN STRFTIME('%s', :begin) AND
                    STRFTIME('%s', :end) AND pt.game_id = :game_id
                AND migrated IS NULL
                GROUP BY STRFTIME('%Y-%m-%d', STRFTIME('%s', date_time), 'unixepoch'),
                         pt.game_id,
                         gd.name
            """,
                {
                    "begin": begin.isoformat(),
                    "end": end.isoformat(),
                    "game_id": game_id,
                },
            ).fetchall()

        result = connection.execute(
            """
                SELECT STRFTIME('%Y-%m-%d', STRFTIME('%s', date_time), 'unixepoch') as date,
                    pt.game_id as game_id,
                    gd.name as game_name,
                    SUM(duration) as total_time,
                    COUNT(pt.game_id) AS sessions
                FROM play_time pt
                        LEFT JOIN game_dict gd ON pt.game_id = gd.game_id
                WHERE STRFTIME('%s', date_time) BETWEEN STRFTIME('%s', :begin) AND
                    STRFTIME('%s', :end)
                AND migrated IS NULL
                GROUP BY STRFTIME('%Y-%m-%d', STRFTIME('%s', date_time), 'unixepoch'),
                         pt.game_id,
                         gd.name
            """,
            {"begin": begin.isoformat(), "end": end.isoformat()},
        ).fetchall()
        return result

    def fetch_last_playtime_session_information(
        self, game_id: str
    ) -> SessionInformation:
        with self._db.transactional() as connection:
            return self._fetch_last_playtime_session_information(connection, game_id)

    def _fetch_last_playtime_session_information(
        self, connection: sqlite3.Connection, game_id: str
    ) -> SessionInformation:
        connection.row_factory = lambda c, row: SessionInformation(
            date=row[0],
            duration=row[1],
            migrated=row[2],
        )

        return connection.execute(
            """
            SELECT
                pt.date_time,
                pt.duration,
                pt.migrated
            FROM
                play_time pt
            WHERE
                pt.game_id = ?
            ORDER BY
                pt.date_time
            DESC LIMIT 1;
            """,
            (game_id,),
        ).fetchone()

    def fetch_per_day_game_sessions_report(
        self, date: str, game_id: str
    ) -> List[SessionInformation]:
        with self._db.transactional() as connection:
            return self._fetch_per_day_game_sessions_report(connection, date, game_id)

    def _fetch_per_day_game_sessions_report(
        self,
        connection: sqlite3.Connection,
        date: str,
        game_id: str,
    ) -> List[SessionInformation]:
        connection.row_factory = lambda c, row: SessionInformation(
            date=row[0],
            duration=row[1],
            migrated=row[2],
        )

        return connection.execute(
            """
                SELECT
                    pt.date_time,
                    pt.duration,
                    pt.migrated
                FROM
                    play_time pt
                WHERE
                    pt.game_id = :game_id
                AND
                    STRFTIME('%Y-%m-%d', date_time) = :date
                ORDER BY
                    pt.date_time;
            """,
            {
                "date": date,
                "game_id": game_id,
            },
        ).fetchall()

    def fetch_game_sessions_report(self, game_id: str) -> List[SessionInformation]:
        with self._db.transactional() as connection:
            return self._fetch_game_sessions_report(connection, game_id)

    def _fetch_game_sessions_report(
        self, connection: sqlite3.Connection, game_id: str
    ) -> List[SessionInformation]:
        connection.row_factory = lambda c, row: SessionInformation(
            date=row[0],
            duration=row[1],
            migrated=row[2],
        )

        return connection.execute(
            """
                SELECT
                    pt.date_time,
                    pt.duration,
                    pt.migrated
                FROM
                    play_time pt
                WHERE
                    pt.game_id = :game_id
                ORDER BY
                    pt.date_time;
            """,
            {
                "game_id": game_id,
            },
        ).fetchall()

    def fetch_all_game_sessions_report(self) -> List[tuple[str, SessionInformation]]:
        with self._db.transactional() as connection:
            connection.row_factory = lambda c, row: (
                row[0],  # game_id
                SessionInformation(
                    date=row[1],
                    duration=row[2],
                    migrated=row[3],
                ),
            )

            return connection.execute(
                """
                    SELECT
                        pt.game_id,
                        pt.date_time,
                        pt.duration,
                        pt.migrated
                    FROM
                        play_time pt
                    ORDER BY
                        pt.game_id, pt.date_time;
                """
            ).fetchall()

    def fetch_all_last_playtime_session_information(
        self,
    ) -> Dict[str, SessionInformation]:
        with self._db.transactional() as connection:
            connection.row_factory = lambda c, row: (
                row[0],  # game_id
                SessionInformation(
                    date=row[1],
                    duration=row[2],
                    migrated=row[3],
                ),
            )
            # This query assumes you want the latest session per game
            return dict(
                connection.execute(
                    """
                    SELECT
                        pt.game_id,
                        pt.date_time,
                        pt.duration,
                        pt.migrated
                    FROM
                        play_time pt
                    INNER JOIN (
                        SELECT
                            game_id,
                            MAX(date_time) AS max_date
                        FROM
                            play_time
                        GROUP BY
                            game_id
                    ) latest
                    ON pt.game_id = latest.game_id AND pt.date_time = latest.max_date
                """
                ).fetchall()
            )

    def get_game(self, game_id: str) -> GameInformationDto | None:
        with self._db.transactional() as connection:
            return self._get_game(connection, game_id)

    def _get_game(
        self, connection: sqlite3.Connection, game_id: str
    ) -> GameInformationDto | None:
        connection.row_factory = lambda c, row: GameInformationDto(
            game_id=row[0], name=row[1], time=row[2]
        )

        return connection.execute(
            """
            SELECT
                gd.game_id,
                gd.name,
                ot.duration as time
            FROM
                game_dict gd
            INNER JOIN overall_time ot
                ON gd.game_id = ot.game_id
            WHERE
                gd.game_id = ?
            """,
            (game_id,),
        ).fetchone()

    def get_games_dictionary(self) -> List[GameDictionary]:
        with self._db.transactional() as connection:
            return self._get_games_dictionary(connection)

    def _get_games_dictionary(
        self, connection: sqlite3.Connection
    ) -> List[GameDictionary]:
        connection.row_factory = lambda c, row: GameDictionary(
            id=row[0],
            name=row[1],
        )

        return connection.execute(
            """
            SELECT
                gd.game_id,
                gd.name
            FROM
                game_dict gd;
            """,
        ).fetchall()

    def get_game_files_checksum(self, game_id: str) -> List[FileChecksum]:
        with self._db.transactional() as connection:
            return self._get_game_files_checksum(connection, game_id)

    def _get_game_files_checksum(
        self, connection: sqlite3.Connection, game_id: str
    ) -> List[FileChecksum]:
        connection.row_factory = lambda c, row: FileChecksum(
            row[0], row[1], row[2], row[3], row[4], row[5]
        )

        return connection.execute(
            """
            SELECT
                gfh.hash_id,
                gfh.checksum,
                gfh.algorithm,
                gfh.chunk_size,
                gfh.created_at,
                gfh.updated_at
            FROM
                game_file_hash gfh
            WHERE
                gfh.game_id = ?
            """,
            (game_id,),
        ).fetchall()

    def save_game_checksum(
        self,
        game_id: str,
        hash_checksum: str,
        hash_algorithm: str,
        hash_chunk_size: int,
        hash_created_at: None | str,
        hash_updated_at: None | str,
    ) -> None:
        with self._db.transactional() as connection:
            self._save_game_checksum(
                connection,
                game_id,
                hash_checksum,
                hash_algorithm,
                hash_chunk_size,
                hash_created_at,
                hash_updated_at,
            )

    def _save_game_checksum(
        self,
        connection: sqlite3.Connection,
        game_id: str,
        hash_checksum: str,
        hash_algorithm: str,
        hash_chunk_size: int,
        hash_created_at: None | str,
        hash_updated_at: None | str,
    ):
        connection.execute(
            """
                INSERT INTO game_file_hash(game_id, checksum, algorithm, chunk_size, created_at, updated_at)
                VALUES (?, ?, ?, ?, IFNULL(?, CURRENT_TIMESTAMP), IFNULL(?, CURRENT_TIMESTAMP))
                """,
            (
                game_id,
                hash_checksum,
                hash_algorithm,
                hash_chunk_size,
                hash_created_at,
                hash_updated_at,
            ),
        )

    def remove_game_checksum(
        self,
        game_id: str,
        checksum: str,
    ) -> None:
        with self._db.transactional() as connection:
            self._remove_game_checksum(
                connection,
                game_id,
                checksum,
            )

    def _remove_game_checksum(
        self,
        connection: sqlite3.Connection,
        game_id: str,
        checksum: str,
    ):
        connection.execute(
            """
                DELETE FROM game_file_hash WHERE game_id = ? AND checksum = ?
                """,
            (
                game_id,
                checksum,
            ),
        )

    def remove_all_game_checksums(
        self,
        game_id: str,
    ) -> None:
        with self._db.transactional() as connection:
            self._remove_all_game_checksums(
                connection,
                game_id,
            )

    def _remove_all_game_checksums(
        self,
        connection: sqlite3.Connection,
        game_id: str,
    ):
        connection.execute(
            """
                DELETE FROM game_file_hash WHERE game_id = ?
                """,
            (game_id,),
        )
