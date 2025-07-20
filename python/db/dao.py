from dataclasses import dataclass
import datetime
import logging
import sqlite3
from typing import List, Dict, Set, Optional, Collection
from collections import defaultdict

from python.db.sqlite_db import SqlLiteDb

logger = logging.getLogger()


@dataclass
class GameTimeDto:
    game_id: str
    game_name: str
    time: int
    checksum: str


@dataclass
class DailyGameTimeDto:
    date: str
    game_id: str
    game_name: str
    time: int
    sessions: int
    checksum: str | None


@dataclass
class SessionInformation:
    date: str
    duration: float
    migrated: str | None
    checksum: str | None


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
    checksum_id: int
    game_id: str
    checksum: str
    algorithm: str
    chunk_size: int
    created_at: None | str
    updated_at: None | str


@dataclass
class GameDictionary:
    id: str
    name: str


@dataclass
class GamesChecksum:
    game_id: str
    checksum: str


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

    def fetch_overall_playtime(self) -> List[GameTimeDto]:
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
    ) -> List[GameTimeDto]:
        connection.row_factory = lambda c, row: GameTimeDto(
            game_id=row[0],
            game_name=row[1],
            time=row[2],
            checksum=row[3],
        )

        return connection.execute(
            """
            SELECT
                ot.game_id,
                gd.name AS game_name,
                ot.duration,
                gfc.checksum
            FROM
                overall_time ot
            JOIN 
                game_dict gd ON ot.game_id = gd.game_id
            LEFT JOIN (
                SELECT game_id, MIN(checksum) AS checksum
                FROM game_file_checksum
                GROUP BY game_id
            ) gfc ON ot.game_id = gfc.game_id;
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
            date=row[0],
            game_id=row[1],
            game_name=row[2],
            time=row[3],
            sessions=row[4],
            checksum=row[5],
        )

        if game_id:
            return connection.execute(
                """
                SELECT
                    STRFTIME('%Y-%m-%d', pt.date_time) AS date,
                    pt.game_id,
                    gd.name AS game_name,
                    SUM(pt.duration) AS total_time,
                    COUNT(*) AS sessions,
                    gfc.checksum
                FROM play_time pt
                LEFT JOIN game_dict gd ON pt.game_id = gd.game_id
                LEFT JOIN game_file_checksum gfc ON gfc.game_id = pt.game_id
                WHERE pt.date_time BETWEEN :begin AND :end
                    AND pt.game_id = :game_id
                    AND pt.migrated IS NULL
                GROUP BY
                    STRFTIME('%Y-%m-%d', pt.date_time),
                    pt.game_id;
            """,
                {
                    "begin": begin.isoformat(),
                    "end": end.isoformat(),
                    "game_id": game_id,
                },
            ).fetchall()

        result = connection.execute(
            """
            SELECT
                STRFTIME('%Y-%m-%d', pt.date_time) AS date,
                pt.game_id,
                gd.name AS game_name,
                SUM(pt.duration) AS total_time,
                COUNT(*) AS sessions,
                gfc.checksum
            FROM play_time pt
            LEFT JOIN game_dict gd ON pt.game_id = gd.game_id
            LEFT JOIN game_file_checksum gfc ON gfc.game_id = pt.game_id
            WHERE pt.date_time BETWEEN :begin AND :end
                AND pt.migrated IS NULL
            GROUP BY
                STRFTIME('%Y-%m-%d', pt.date_time),
                pt.game_id;
            """,
            {"begin": begin.isoformat(), "end": end.isoformat()},
        ).fetchall()
        return result

    def fetch_all_game_sessions_report(self) -> List[tuple[str, SessionInformation]]:
        with self._db.transactional() as connection:
            connection.row_factory = lambda c, row: (
                row[0],  # game_id
                SessionInformation(
                    date=row[1], duration=row[2], migrated=row[3], checksum=row[4]
                ),
            )

            return connection.execute(
                """
                SELECT
                    pt.game_id,
                    pt.date_time,
                    pt.duration,
                    pt.migrated,
                    gfc.checksum
                FROM
                    play_time pt
                LEFT JOIN
                    game_file_checksum gfc
                ON
                    pt.game_id = gfc.game_id
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
                    checksum=row[4],
                ),
            )

            return dict(
                connection.execute(
                    """
                SELECT
                    pt.game_id,
                    pt.date_time,
                    pt.duration,
                    pt.migrated,
                    gfc.checksum
                FROM (
                    SELECT
                        *,
                        ROW_NUMBER() OVER (PARTITION BY game_id ORDER BY date_time DESC) AS rn
                    FROM play_time
                ) pt
                LEFT JOIN game_file_checksum gfc ON gfc.game_id = pt.game_id
                WHERE pt.rn = 1;
                """
                ).fetchall()
            )

    def fetch_sessions_for_period(
        self,
        start_time: datetime.datetime,
        end_time: datetime.datetime,
        game_id: Optional[str] = None,
    ) -> Dict[str, Dict[str, List[SessionInformation]]]:
        with self._db.transactional() as connection:
            return self._fetch_sessions_for_period(
                connection,
                start_time,
                end_time,
                game_id,
            )

    def _fetch_sessions_for_period(
        self,
        connection: sqlite3.Connection,
        start_time: datetime.datetime,
        end_time: datetime.datetime,
        game_id: Optional[str] = None,
    ) -> Dict[str, Dict[str, List[SessionInformation]]]:
        query = """
            SELECT
                strftime('%Y-%m-%d', pt.date_time) as session_date,
                pt.game_id,
                pt.date_time,
                pt.duration,
                pt.migrated,
                gfc.checksum
            FROM
                play_time pt
            LEFT JOIN
                game_file_checksum gfc ON pt.game_id = gfc.game_id
            WHERE
                pt.date_time >= :start AND pt.date_time < :end
            {game_id_filter}
            ORDER BY
                session_date, pt.game_id, pt.date_time;
        """

        params = {
            "start": start_time.isoformat(),
            "end": end_time.isoformat(),
        }

        game_id_filter = ""
        if game_id is not None:
            game_id_filter = "AND pt.game_id = :game_id"
            params["game_id"] = game_id

        query = query.format(game_id_filter=game_id_filter)

        sessions_by_day_and_game: Dict[str, Dict[str, List[SessionInformation]]] = (
            defaultdict(lambda: defaultdict(list))
        )

        connection.row_factory = lambda c, row: (
            row[0],  # session_date
            row[1],  # game_id
            SessionInformation(
                date=row[2],
                duration=row[3],
                migrated=row[4],
                checksum=row[5],
            ),
        )

        rows = connection.execute(query, params).fetchall()

        for session_date, game_id_val, session_info in rows:
            sessions_by_day_and_game[session_date][game_id_val].append(session_info)

        return sessions_by_day_and_game

    def fetch_last_sessions_for_games(
        self,
        game_ids: Collection[str],
    ) -> Dict[str, SessionInformation]:
        with self._db.transactional() as connection:
            return self._fetch_last_sessions_for_games(
                connection,
                game_ids,
            )

    def _fetch_last_sessions_for_games(
        self,
        connection: sqlite3.Connection,
        game_ids: Collection[str],
    ) -> Dict[str, SessionInformation]:
        game_ids_list = list(game_ids)
        placeholders = ", ".join("?" for _ in game_ids_list)

        connection.row_factory = lambda c, row: (
            row[0],
            SessionInformation(
                date=row[1],
                duration=row[2],
                migrated=row[3],
                checksum=row[4],
            ),
        )

        query = f"""
            SELECT
                pt.game_id,
                pt.date_time,
                pt.duration,
                pt.migrated,
                gfc.checksum
            FROM (
                SELECT
                    *,
                    ROW_NUMBER() OVER (PARTITION BY game_id ORDER BY date_time DESC) AS rn
                FROM play_time
                WHERE game_id IN ({placeholders})
            ) pt
            LEFT JOIN game_file_checksum gfc ON gfc.game_id = pt.game_id
            WHERE pt.rn = 1;
        """

        rows = connection.execute(query, game_ids_list).fetchall()

        return dict(rows)

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
            row[0], row[1], row[2], row[3], row[4], row[5], row[6]
        )

        return connection.execute(
            """
            SELECT
                gfc.checksum_id,
                gfc.game_id,
                gfc.checksum,
                gfc.algorithm,
                gfc.chunk_size,
                gfc.created_at,
                gfc.updated_at
            FROM
                game_file_checksum gfc
            WHERE
                gfc.game_id = ?
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
                INSERT INTO game_file_checksum(game_id, checksum, algorithm, chunk_size, created_at, updated_at)
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
                DELETE FROM game_file_checksum WHERE game_id = ? AND checksum = ?
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
                DELETE FROM game_file_checksum WHERE game_id = ?
                """,
            (game_id,),
        )

    def get_games_checksum(
        self,
    ) -> List[GamesChecksum]:
        with self._db.transactional() as connection:
            return self._get_games_checksum(
                connection,
            )

    def _get_games_checksum(
        self,
        connection: sqlite3.Connection,
    ) -> List[GamesChecksum]:
        connection.row_factory = lambda c, row: GamesChecksum(row[0], row[1])

        return connection.execute(
            """
            SELECT
                gfc.game_id,
                gfc.checksum
            FROM
                game_file_checksum gfc;
            """,
        ).fetchall()
