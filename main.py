import decky
import dataclasses
import os
import sys
import asyncio
from pathlib import Path


decky_home = os.environ["DECKY_HOME"]
log_dir = os.environ["DECKY_PLUGIN_LOG_DIR"]
data_dir = os.environ["DECKY_PLUGIN_RUNTIME_DIR"]
plugin_dir = Path(os.environ["DECKY_PLUGIN_DIR"])


def add_plugin_to_path():
    directories = [["./"], ["python"]]

    for import_dir in directories:
        sys.path.append(str(plugin_dir.joinpath(*import_dir)))


add_plugin_to_path()

# pylint: disable=wrong-import-order, wrong-import-position
# ruff: noqa: E402
from python.db.dao import Dao
from python.db.migration import DbMigration
from python.db.sqlite_db import SqlLiteDb
from python.files import Files
from python.games import Games
from python.helpers import parse_date
from python.statistics import Statistics
from python.time_tracking import TimeTracking
from python.schemas.request import (
    AddGameChecksumDict,
    AddTimeDict,
    ApplyManualTimeCorrectionDTO,
    DailyStatisticsForPeriodDict,
    GetFileSHA256DTO,
    GetGameDTO,
    RemoveAllGameChecksumsDTO,
    RemoveGameChecksumDTO,
)
from python.dto.save_game_checksum import AddGameChecksumDTO
from python.dto.statistics.daily_statistics_for_period import (
    DailyStatisticsForPeriodDTO,
)
from python.dto.time.add_time import AddTimeDTO


# pylint: enable=wrong-import-order, wrong-import-position

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
            raise e

    async def add_time(self, dto_dict: AddTimeDict):
        try:
            dto = AddTimeDTO.from_dict(dto_dict)

            self.time_tracking.add_time(
                dto.started_at,
                dto.ended_at,
                dto.game_id,
                dto.game_name,
            )
        except Exception as e:
            decky.logger.exception("[add_time] Unhandled exception: %s", e)
            raise e

    async def daily_statistics_for_period(self, dto_dict: DailyStatisticsForPeriodDict):
        try:
            dto = DailyStatisticsForPeriodDTO.from_dict(dto_dict)

            return dataclasses.asdict(
                self.statistics.daily_statistics_for_period(
                    parse_date(dto.start_date),
                    parse_date(dto.end_date),
                    dto.game_id,
                )
            )
        except Exception as e:
            decky.logger.exception(
                "[daily_statistics_for_period] Unhandled exception: %s", e
            )
            raise e

    async def per_game_overall_statistics(self):
        try:
            return self.statistics.per_game_overall_statistic()
        except Exception as e:
            decky.logger.exception(
                "[per_game_overall_statistics] Unhandled exception: %s", e
            )
            raise e

    async def apply_manual_time_correction(
        self, list_of_game_stats: ApplyManualTimeCorrectionDTO
    ):
        try:
            return self.time_tracking.apply_manual_time_for_games(
                list_of_game_stats=list_of_game_stats, source="manually-changed"
            )
        except Exception as e:
            decky.logger.exception(
                "[apply_manual_time_correction] Unhandled exception: %s", e
            )
            raise e

    async def get_game(self, game_id: GetGameDTO):
        try:
            game_by_id = self.games.get_by_id(game_id)

            if game_by_id is None:
                return None

            return dataclasses.asdict(game_by_id)
        except Exception as e:
            decky.logger.exception("[get_game] Unhandled exception: %s", e)
            raise e

    async def has_min_required_python_version(self) -> bool:
        if sys.version_info < (3, 11):
            return False

        return True

    async def get_file_sha256(self, path: GetFileSHA256DTO):
        try:
            return await asyncio.to_thread(self.files.get_file_sha256, path)
        except Exception as e:
            decky.logger.exception("[get_file_sha256] Unhandled exception: %s", e)
            raise e

    async def get_games_dictionary(self):
        try:
            return self.games.get_dictionary()
        except Exception as e:
            decky.logger.exception("[get_games_dictionary] Unhandled exception: %s", e)
            raise e

    async def save_game_checksum(self, dto_dict: AddGameChecksumDict):
        try:
            dto = AddGameChecksumDTO.from_dict(dto_dict)

            return self.games.save_game_checksum(
                dto.game_id,
                dto.checksum,
                dto.algorithm,
                dto.chunk_size,
                dto.created_at,
                dto.updated_at,
            )
        except Exception as e:
            decky.logger.exception("[save_game_checksum] Unhandled exception: %s", e)
            raise e

    async def remove_game_checksum(self, dto: RemoveGameChecksumDTO):
        try:
            return self.games.remove_game_checksum(dto["game_id"], dto["checksum"])
        except Exception as e:
            decky.logger.exception("[remove_game_checksum] Unhandled exception: %s", e)
            raise e

    async def remove_all_game_checksum(self, game_id: RemoveAllGameChecksumsDTO):
        try:
            return self.games.remove_all_game_checksums(game_id)
        except Exception as e:
            decky.logger.exception("[remove_game_checksum] Unhandled exception: %s", e)
            raise e

    async def get_games_checksum(
        self,
    ):
        try:
            return self.games.get_games_checksum()
        except Exception as e:
            decky.logger.exception("[get_games_checksum] Unhandled exception: %s", e)
            raise e

    async def _unload(self):
        decky.logger.info("Goodnight, World!")

    async def _uninstall(self):
        decky.logger.info("Goodbye, World!")
