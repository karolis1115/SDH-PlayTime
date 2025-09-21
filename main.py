import decky
import dataclasses
import os
import sys
import asyncio
from pathlib import Path
from typing import List


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

import re


def to_camel_case(snake_str):
    """
    Converts a snake_case string to camelCase.

    _leading_underscores are removed.
    For example: "__my_string" -> "myString"
    """
    # Use a regex to find all occurrences of an underscore followed by a letter
    # and replace it with the uppercase version of that letter.
    # The lambda function m.group(1).upper() takes the matched group (the letter)
    # and converts it to uppercase.
    # Example: for "user_id", it finds "_i" and replaces it with "I".
    camel_string = re.sub(r"_([a-zA-Z0-9])", lambda m: m.group(1).upper(), snake_str)

    # Remove any leading underscores that might remain if the string started with them
    return camel_string.lstrip("_")


def convert_keys_to_camel_case(data):
    """
    Recursively converts all keys in a dictionary or a list of dictionaries
    from snake_case to camelCase.

    Args:
        data: A dict, list, or other python object.

    Returns:
        A new object with all dictionary keys converted to camelCase.
        Non-dict and non-list items are returned as is.
    """
    if isinstance(data, dict):
        # It's a dictionary, process its keys and values
        new_dict = {}
        for key, value in data.items():
            # Convert the key to camelCase
            new_key = to_camel_case(key)
            # Recursively call the function on the value
            new_dict[new_key] = convert_keys_to_camel_case(value)
        return new_dict

    elif isinstance(data, list):
        # It's a list, process each item in the list
        return [convert_keys_to_camel_case(item) for item in data]

    else:
        # It's a primitive type (str, int, etc.), return it as is
        return data


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

            return convert_keys_to_camel_case(
                dataclasses.asdict(
                    self.statistics.daily_statistics_for_period(
                        parse_date(dto.start_date),
                        parse_date(dto.end_date),
                        dto.game_id,
                    )
                )
            )
        except Exception as e:
            decky.logger.exception(
                "[daily_statistics_for_period] Unhandled exception: %s", e
            )
            raise e

    async def statistics_for_last_two_weeks(self):
        try:
            return convert_keys_to_camel_case(
                self.statistics.get_statistics_for_last_two_weeks()
            )

        except Exception as e:
            decky.logger.exception(
                "[statistics_for_GameDictionary_weeks] Unhandled exception: %s", e
            )
            raise e

    async def fetch_playtime_information(self):
        try:
            return convert_keys_to_camel_case(
                self.statistics.fetch_playtime_information()
            )

        except Exception as e:
            decky.logger.exception(
                "[fetch_playtime_information] Unhandled exception: %s", e
            )
            raise e

    async def per_game_overall_statistics(self):
        try:
            return convert_keys_to_camel_case(
                self.statistics.per_game_overall_statistic()
            )
        except Exception as e:
            decky.logger.exception(
                "[per_game_overall_statistics] Unhandled exception: %s", e
            )
            raise e

    async def short_per_game_overall_statistics(self):
        try:
            return convert_keys_to_camel_case(
                self.statistics.per_game_overall_statistic()
            )
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

            return convert_keys_to_camel_case(dataclasses.asdict(game_by_id))
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
            return convert_keys_to_camel_case(self.games.get_dictionary())
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

    async def save_game_checksum_bulk(self, dtos_list: List[AddGameChecksumDict]):
        try:
            dtos = [AddGameChecksumDTO.from_dict(dto_dict) for dto_dict in dtos_list]

            return self.games.save_game_checksum_bulk(dtos)
        except Exception as e:
            decky.logger.exception(
                "[save_game_checksum_bulk] Unhandled exception: %s", e
            )
            raise e

    async def remove_game_checksum(self, dto: RemoveGameChecksumDTO):
        try:
            return convert_keys_to_camel_case(
                self.games.remove_game_checksum(dto["game_id"], dto["checksum"])
            )
        except Exception as e:
            decky.logger.exception("[remove_game_checksum] Unhandled exception: %s", e)
            raise e

    async def remove_all_game_checksum(self, game_id: RemoveAllGameChecksumsDTO):
        try:
            return convert_keys_to_camel_case(
                self.games.remove_all_game_checksums(game_id)
            )
        except Exception as e:
            decky.logger.exception("[remove_game_checksum] Unhandled exception: %s", e)
            raise e

    async def remove_all_checksums(self):
        try:
            return self.games.remove_all_checksums()
        except Exception as e:
            decky.logger.exception("[remove_all_checksums] Unhandled exception: %s", e)
            raise e

    async def get_games_checksum(
        self,
    ):
        try:
            return convert_keys_to_camel_case(self.games.get_games_checksum())
        except Exception as e:
            decky.logger.exception("[get_games_checksum] Unhandled exception: %s", e)
            raise e

    async def link_game_to_game_with_checksum(
        self, child_game_id: str, parent_game_id: str
    ):
        try:
            return self.games.link_game_to_game_with_checksum(
                child_game_id, parent_game_id
            )
        except Exception as e:
            decky.logger.exception(
                "[link_game_to_game_with_checksum] Unhandled exception: %s", e
            )
            raise e

    async def _unload(self):
        decky.logger.info("Goodnight, World!")

    async def _uninstall(self):
        decky.logger.info("Goodbye, World!")
