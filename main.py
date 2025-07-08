import decky
import dataclasses
import os
import sys
import asyncio
from pathlib import Path
from typing import Any, List


decky_home = os.environ["DECKY_HOME"]
log_dir = os.environ["DECKY_PLUGIN_LOG_DIR"]
data_dir = os.environ["DECKY_PLUGIN_RUNTIME_DIR"]
plugin_dir = Path(os.environ["DECKY_PLUGIN_DIR"])


def add_plugin_to_path():
    directories = [["./"], ["python"]]

    for import_dir in directories:
        sys.path.append(str(plugin_dir.joinpath(*import_dir)))


add_plugin_to_path()

# pylint: disable=wrong-import-position
from python.db.dao import Dao
from python.db.migration import DbMigration
from python.db.sqlite_db import SqlLiteDb
from python.files import Files
from python.games import Games
from python.helpers import parse_date
from python.statistics import Statistics
from python.time_tracking import TimeTracking

# pylint: enable=wrong-import-position

# autopep8: on


class Plugin:
    files: Files = Files()
    games: Games
    statistics: Statistics
    time_tracking: TimeTracking

    async def _main(self):
        try:
            db = SqlLiteDb(f"{data_dir}/storage.db")
            migration = DbMigration(db)
            migration.migrate()

            dao = Dao(db)

            self.games = Games(dao)
            self.statistics = Statistics(dao)
            self.time_tracking = TimeTracking(dao)
        except Exception as e:
            decky.logger.exception("[main] Unhandled exception: %s", e)

    async def add_time(
        self, started_at: int, ended_at: int, game_id: str, game_name: str
    ):
        try:
            self.time_tracking.add_time(
                started_at=started_at,
                ended_at=ended_at,
                game_id=game_id,
                game_name=game_name,
            )
        except Exception as e:
            decky.logger.exception("[add_time] Unhandled exception: %s", e)

    async def daily_statistics_for_period(
        self, start_date: str, end_date: str, game_id: str
    ):
        try:
            return dataclasses.asdict(
                self.statistics.daily_statistics_for_period(
                    parse_date(start_date), parse_date(end_date), game_id
                )
            )
        except Exception as e:
            decky.logger.exception(
                "[daily_statistics_for_period] Unhandled exception: %s", e
            )

    async def per_game_overall_statistics(self):
        try:
            return self.statistics.per_game_overall_statistic()
        except Exception as e:
            decky.logger.exception(
                "[per_game_overall_statistics] Unhandled exception: %s", e
            )

    async def apply_manual_time_correction(
        self, list_of_game_stats: List[dict[str, Any]]
    ):
        try:
            return self.time_tracking.apply_manual_time_for_games(
                list_of_game_stats=list_of_game_stats, source="manually-changed"
            )
        except Exception as e:
            decky.logger.exception(
                "[apply_manual_time_correction] Unhandled exception: %s", e
            )

    async def get_game(self, game_id: str):
        try:
            return dataclasses.asdict(self.games.get_by_id(game_id))
        except Exception as e:
            decky.logger.exception("[get_game] Unhandled exception: %s", e)

    async def has_min_required_python_version(self) -> bool:
        if sys.version_info < (3, 11):
            return False

        return True

    async def get_file_sha256(self, path: str):
        try:
            return await asyncio.to_thread(self.files.get_file_sha256, path)
        except Exception as e:
            decky.logger.exception("[get_file_sha256] Unhandled exception: %s", e)

    async def get_games_dictionary(self):
        try:
            return self.games.get_dictionary()
        except Exception as e:
            decky.logger.exception("[get_games_dictionary] Unhandled exception: %s", e)

    async def _unload(self):
        decky.logger.info("Goodnight, World!")

    async def _uninstall(self):
        decky.logger.info("Goodbye, World!")
