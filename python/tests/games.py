import unittest
from datetime import datetime, timedelta
from python.tests.helpers import AbstractDatabaseTest
from python.db.migration import DbMigration
from python.games import Games
from python.db.dao import Dao
from python.time_tracking import TimeTracking
from python.statistics import Statistics


class TestGame(AbstractDatabaseTest):
    games: Games
    dao: Dao
    time_tracking: TimeTracking
    playtime_statistics: Statistics

    def setUp(self) -> None:
        super().setUp()
        DbMigration(db=self.database).migrate()
        self.games = Games(Dao(self.database))
        self.dao = Dao(db=self.database)
        self.time_tracking = TimeTracking(Dao(self.database))
        self.playtime_statistics = Statistics(Dao(self.database))

    def test_shoulld_save_game_checksum(self):
        self.dao.save_game_dict("100", "Zelda BOTW")
        self.dao.save_game_dict("1001", "Zelda BOTW 2")

        self.games.save_game_checksum(
            "100",
            "8d01416611a03b7c979d6fdee3b16006da68e29b5bd5cbc8785bc0e10205b7e8",
            "SHA256",
            16 * 1024 * 1024,
            None,
            None,
        )
        self.games.save_game_checksum(
            "1001",
            "8d01416611a03b7c979d6fdee3b16006da68e29b5bd5cbc8785bc0e10205b7e8",
            "SHA256",
            16 * 1024 * 1024,
            None,
            None,
        )
        self.games.save_game_checksum(
            "15439",
            "8d01416611a03b7c979d6fdee3b16006da68e29b5bd5cbc8785bc0e10205b7e8",
            "SHA256",
            16 * 1024 * 1024,
            None,
            None,
        )
        self.games.save_game_checksum(
            "666",
            "8d01416611a03b7c979d6fdee3b16006da68e29b5bd5cbc8785bc0e10205b7e8",
            "SHA256",
            16 * 1024 * 1024,
            None,
            None,
        )

        self.games.save_game_checksum(
            "184328543",
            "c021416611a03b7c979d6fdee3b16006da68e29b5bd5cbc8785bc0e10205b7e8",
            "SHA256",
            16 * 1024 * 1024,
            None,
            None,
        )

        self.games.save_game_checksum(
            "1",
            "c021416611a03b7c979d6fdee3b16006da68e29b5bd5cbc8785bc0e10205b7e8",
            "SHA256",
            16 * 1024 * 1024,
            None,
            None,
        )

        result = self.games.get_dictionary()

        result = self.games.get_games_checksum()

        now = datetime(2022, 1, 1, 9, 0)

        self.time_tracking.add_time(
            now.timestamp(), (now + timedelta(hours=1)).timestamp(), "101", "Zelda BOTW"
        )
        self.time_tracking.add_time(
            (now + timedelta(hours=1)).timestamp(),
            (now + timedelta(hours=1, minutes=30)).timestamp(),
            "101",
            "Zelda BOTW",
        )

        result = self.playtime_statistics.per_game_overall_statistic()

        self.assertEqual(result[0]["time"], 3600 + 1800)


if __name__ == "__main__":
    unittest.main()
