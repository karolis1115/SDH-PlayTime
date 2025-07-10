from python.db.dao import Dao
from typing import Dict, List
import dataclasses
from python.models import (
    GameDictionary,
    GameInformation,
)


class Games:
    dao: Dao

    def __init__(self, dao: Dao) -> None:
        self.dao = dao

    def get_by_id(self, game_id: str) -> GameInformation:
        response = self.dao.get_game(game_id)

        return GameInformation(
            id=response.game_id, name=response.name, time=response.time
        )

    def get_dictionary(self) -> List[Dict[str, GameDictionary]]:
        data = self.dao.get_games_dictionary()

        result: List[Dict[str, GameDictionary]] = []

        for game in data:
            result.append(
                dataclasses.asdict(
                    GameDictionary(id=game.id, name=game.name, checksum=game.checksum)
                )
            )

        return result
