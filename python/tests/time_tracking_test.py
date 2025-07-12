import dataclasses
import unittest
from datetime import datetime, timedelta
from python.db.dao import Dao
from python.db.migration import DbMigration
from python.statistics import Statistics
from python.tests.helpers import AbstractDatabaseTest
from python.time_tracking import TimeTracking
from python.dicts import ApplyManualTimeCorrectionList
from python.models import Game


class TestPlayTime(AbstractDatabaseTest):
    time_tracking: TimeTracking

    def setUp(self) -> None:
        super().setUp()
        DbMigration(db=self.database).migrate()
        self.time_tracking = TimeTracking(Dao(self.database))
        self.playtime_statistics = Statistics(Dao(self.database))

    def test_should_add_new_interval(self):
        now = datetime(2022, 1, 1, 9, 0)
        self.time_tracking.add_time(
            now.timestamp(), (now + timedelta(hours=1)).timestamp(), "100", "Zelda BOTW"
        )

        result = self.playtime_statistics.daily_statistics_for_period(
            now.date(), now.date()
        )
        self.assertEqual(
            [dataclasses.asdict(r) for r in result.data],
            [
                {
                    "date": "2022-01-01",
                    "games": [
                        {
                            "game": {
                                "id": "100",
                                "name": "Zelda BOTW",
                            },
                            "time": 3600,
                            "sessions": [
                                {
                                    "date": "2022-01-01T09:00:00",
                                    "duration": 3600,
                                    "migrated": None,
                                },
                            ],
                            "last_session": {
                                "date": "2022-01-01T09:00:00",
                                "duration": 3600,
                                "migrated": None,
                            },
                        }
                    ],
                    "total": 3600,
                }
            ],
        )

    def test_should_add_new_interval_to_existing_game(self):
        now = datetime(2022, 1, 1, 9, 0)
        self.time_tracking.add_time(
            now.timestamp(),
            (now + timedelta(hours=1)).timestamp(),
            "3647351456",
            "Zelda BOTW",
        )
        self.time_tracking.add_time(
            (now + timedelta(hours=1)).timestamp(),
            (now + timedelta(hours=2)).timestamp(),
            "3647351456",
            "Zelda BOTW",
        )

        result = self.playtime_statistics.daily_statistics_for_period(
            now.date(), now.date()
        )
        self.assertEqual(
            [dataclasses.asdict(r) for r in result.data],
            [
                {
                    "date": "2022-01-01",
                    "games": [
                        {
                            "game": {
                                "id": "3647351456",
                                "name": "Zelda BOTW",
                            },
                            "time": 7200,
                            "sessions": [
                                {
                                    "date": "2022-01-01T09:00:00",
                                    "duration": 3600,
                                    "migrated": None,
                                },
                                {
                                    "date": "2022-01-01T10:00:00",
                                    "duration": 3600,
                                    "migrated": None,
                                },
                            ],
                            "last_session": {
                                "date": "2022-01-01T10:00:00",
                                "duration": 3600,
                                "migrated": None,
                            },
                        }
                    ],
                    "total": 7200,
                }
            ],
        )

    def test_should_split_interval_in_two_day_in_case_night_session(self):
        now = datetime(2022, 1, 1, 23, 0)
        next_day = now + timedelta(hours=2)
        self.time_tracking.add_time(
            now.timestamp(), next_day.timestamp(), "100", "Zelda BOTW"
        )

        result = self.playtime_statistics.daily_statistics_for_period(
            now.date(), next_day.date()
        )
        self.assertEqual(
            [dataclasses.asdict(r) for r in result.data],
            [
                {
                    "date": "2022-01-01",
                    "games": [
                        {
                            "game": {
                                "id": "100",
                                "name": "Zelda BOTW",
                            },
                            "time": 3600,
                            "sessions": [
                                {
                                    "date": "2022-01-01T23:00:00",
                                    "duration": 3600,
                                    "migrated": None,
                                }
                            ],
                            "last_session": {
                                "date": "2022-01-02T00:00:00",
                                "duration": 3600,
                                "migrated": None,
                            },
                        }
                    ],
                    "total": 3600,
                },
                {
                    "date": "2022-01-02",
                    "games": [
                        {
                            "game": {
                                "id": "100",
                                "name": "Zelda BOTW",
                            },
                            "time": 3600,
                            "sessions": [
                                {
                                    "date": "2022-01-02T00:00:00",
                                    "duration": 3600,
                                    "migrated": None,
                                }
                            ],
                            "last_session": {
                                "date": "2022-01-02T00:00:00",
                                "duration": 3600,
                                "migrated": None,
                            },
                        }
                    ],
                    "total": 3600,
                },
            ],
        )

    def test_should_sum_total_time_per_day(self):
        now = datetime(2022, 1, 1, 9, 0)
        self.time_tracking.add_time(
            now.timestamp(), (now + timedelta(hours=1)).timestamp(), "100", "Zelda BOTW"
        )
        self.time_tracking.add_time(
            (now + timedelta(hours=1)).timestamp(),
            (now + timedelta(hours=1, minutes=30)).timestamp(),
            "101",
            "Doom",
        )

        result = self.playtime_statistics.daily_statistics_for_period(
            now.date(), now.date()
        )
        self.assertEqual(
            [dataclasses.asdict(r) for r in result.data],
            [
                {
                    "date": "2022-01-01",
                    "games": [
                        {
                            "game": {
                                "id": "100",
                                "name": "Zelda BOTW",
                            },
                            "time": 3600,
                            "sessions": [
                                {
                                    "date": "2022-01-01T09:00:00",
                                    "duration": 3600,
                                    "migrated": None,
                                }
                            ],
                            "last_session": {
                                "date": "2022-01-01T09:00:00",
                                "duration": 3600,
                                "migrated": None,
                            },
                        },
                        {
                            "game": {
                                "id": "101",
                                "name": "Doom",
                            },
                            "time": 1800,
                            "sessions": [
                                {
                                    "date": "2022-01-01T10:00:00",
                                    "duration": 1800,
                                    "migrated": None,
                                }
                            ],
                            "last_session": {
                                "date": "2022-01-01T10:00:00",
                                "duration": 1800,
                                "migrated": None,
                            },
                        },
                    ],
                    "total": 3600 + 1800,
                }
            ],
        )

    def test_return_only_data_in_requested_interval_without_gaps(self):
        date_01 = datetime(2022, 1, 1, 9, 0)
        self.time_tracking.add_time(
            date_01.timestamp(),
            (date_01 + timedelta(hours=1)).timestamp(),
            "100",
            "Zelda BOTW",
        )

        date_02 = datetime(2022, 1, 2, 9, 0)
        self.time_tracking.add_time(
            date_02.timestamp(),
            (date_02 + timedelta(hours=1)).timestamp(),
            "101",
            "Doom",
        )

        date_03 = datetime(2022, 1, 3, 9, 0)
        self.time_tracking.add_time(
            date_03.timestamp(),
            (date_03 + timedelta(minutes=30)).timestamp(),
            "102",
            "Zelda Minish Cap",
        )

        date_04 = datetime(2022, 1, 4, 9, 0)
        self.time_tracking.add_time(
            date_04.timestamp(),
            (date_04 + timedelta(minutes=30)).timestamp(),
            "100",
            "Zelda BOTW",
        )

        date_08 = datetime(2022, 1, 8, 9, 0)

        result = self.playtime_statistics.daily_statistics_for_period(
            date_02.date(), date_08.date()
        )
        # pylint: disable=C0103
        self.maxDiff = None
        self.assertEqual(
            [dataclasses.asdict(r) for r in result.data],
            [
                {
                    "date": "2022-01-02",
                    "games": [
                        {
                            "game": {
                                "id": "101",
                                "name": "Doom",
                            },
                            "time": 3600,
                            "sessions": [
                                {
                                    "date": "2022-01-02T09:00:00",
                                    "duration": 3600,
                                    "migrated": None,
                                }
                            ],
                            "last_session": {
                                "date": "2022-01-02T09:00:00",
                                "duration": 3600,
                                "migrated": None,
                            },
                        }
                    ],
                    "total": 3600,
                },
                {
                    "date": "2022-01-03",
                    "games": [
                        {
                            "game": {
                                "id": "102",
                                "name": "Zelda Minish Cap",
                            },
                            "time": 1800,
                            "sessions": [
                                {
                                    "date": "2022-01-03T09:00:00",
                                    "duration": 1800,
                                    "migrated": None,
                                }
                            ],
                            "last_session": {
                                "date": "2022-01-03T09:00:00",
                                "duration": 1800,
                                "migrated": None,
                            },
                        }
                    ],
                    "total": 1800,
                },
                {
                    "date": "2022-01-04",
                    "games": [
                        {
                            "game": {
                                "id": "100",
                                "name": "Zelda BOTW",
                            },
                            "time": 1800,
                            "sessions": [
                                {
                                    "date": "2022-01-04T09:00:00",
                                    "duration": 1800,
                                    "migrated": None,
                                }
                            ],
                            "last_session": {
                                "date": "2022-01-04T09:00:00",
                                "duration": 1800,
                                "migrated": None,
                            },
                        }
                    ],
                    "total": 1800,
                },
                {"date": "2022-01-05", "games": [], "total": 0},
                {"date": "2022-01-06", "games": [], "total": 0},
                {"date": "2022-01-07", "games": [], "total": 0},
                {"date": "2022-01-08", "games": [], "total": 0},
            ],
        )

    def test_should_calculate_overall_time_for_game(self):
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

    def test_should_apply_manual_time_for_games(self):
        now = datetime(2025, 1, 1, 9, 0)
        five_hours_delay = now + timedelta(hours=5)

        self.time_tracking.add_time(
            now.timestamp(),
            (now + timedelta(hours=1)).timestamp(),
            "101",
            "Zelda BOTW",
        )
        self.time_tracking.add_time(
            five_hours_delay.timestamp(),
            (five_hours_delay + timedelta(minutes=45)).timestamp(),
            "101",
            "Zelda BOTW",
        )

        apps = [
            ApplyManualTimeCorrectionList(game=Game("101", "Zelda BOTW"), time=1800),
        ]

        self.time_tracking.apply_manual_time_for_games(apps, "manually-changed")
        result = self.playtime_statistics.per_game_overall_statistic()

        # NOTE(ynhhoJ): This function remove `date` field from `result`, because when is applied
        # `apply_manual_time_for_games` it creates an internal `now` variable with current timestamp
        def remove_date_fields(data):
            if isinstance(data, list):
                return [remove_date_fields(item) for item in data]

            if isinstance(data, dict):
                return {
                    key: remove_date_fields(value)
                    for key, value in data.items()
                    if key != "date"
                }

            return data

        self.assertEqual(
            remove_date_fields(result),
            [
                {
                    "game": {"id": "101", "name": "Zelda BOTW"},
                    "last_session": {
                        "duration": -4500,
                        "migrated": "manually-changed",
                    },
                    "sessions": [
                        {
                            "duration": 3600,
                            "migrated": None,
                        },
                        {
                            "duration": 2700,
                            "migrated": None,
                        },
                        {
                            "duration": -4500,
                            "migrated": "manually-changed",
                        },
                    ],
                    "time": 1800,
                }
            ],
        )


if __name__ == "__main__":
    unittest.main()
