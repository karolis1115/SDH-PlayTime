from python.db.dao import Dao
from typing import Dict, List
import dataclasses
from python.schemas.response import (
    FileChecksum,
    Game,
    GameDictionary,
    GamePlaytimeSummary,
    GameDictionary,
)


class Games:
    dao: Dao

    def __init__(self, dao: Dao) -> None:
        self.dao = dao

    def get_by_id(self, game_id: str) -> GamePlaytimeSummary | None:
        response = self.dao.get_game(game_id)

        if response is None:
            return None

        return GamePlaytimeSummary(
            Game(response.game_id, response.name), total_time=response.time
        )

    def get_dictionary(self) -> List[Dict[str, GameDictionary]]:
        data = self.dao.get_games_dictionary()

        result: List[Dict[str, GameDictionary]] = []

        for game in data:
            game_files_checksum = self.dao.get_game_files_checksum(game.id)
            file_checksum_list: List[FileChecksum] = []

            for game_file_checksum in game_files_checksum:
                file_checksum_list.append(
                    FileChecksum(
                        Game(game_file_checksum.game_id, game_file_checksum.game_name),
                        game_file_checksum.checksum,
                        game_file_checksum.algorithm,
                        game_file_checksum.chunk_size,
                        game_file_checksum.created_at,
                        game_file_checksum.updated_at,
                    )
                )

            result.append(
                dataclasses.asdict(
                    GameDictionary(Game(game.id, game.name), files=file_checksum_list)
                )
            )

        return result

    def save_game_checksum(
        self,
        game_id: str,
        hash_checksum: str,
        hash_algorithm: str,
        hash_chunk_size: int,
        hash_created_at: None | str,
        hash_updated_at: None | str,
    ):
        self.dao.save_game_checksum(
            game_id,
            hash_checksum,
            hash_algorithm,
            hash_chunk_size,
            hash_created_at,
            hash_updated_at,
        )

    def remove_game_checksum(self, game_id: str, checksum: str):
        self.dao.remove_game_checksum(game_id, checksum)

    def remove_all_game_checksums(self, game_id: str):
        self.dao.remove_all_game_checksums(game_id)

    def get_games_checksum(self):
        games_checksum_without_game_dict = self.dao.get_games_checksum()
        result = []

        for game in games_checksum_without_game_dict:
            result.append(
                dataclasses.asdict(GameDictionary(game.game_id, game.checksum))
            )

        return result
