import dataclasses
from datetime import datetime, date, time, timedelta
from typing import Dict, List, Any
from python.db.dao import DailyGameTimeDto, Dao
from python.helpers import format_date
from python.models import (
    DayStatistics,
    Game,
    GameWithTime,
    SessionInformation,
    PagedDayStatistics,
)


class Statistics:
    dao: Dao

    def __init__(self, dao: Dao) -> None:
        self.dao = dao

    def daily_statistics_for_period(
        self, start: date, end: date, game_id: str | None = None
    ) -> PagedDayStatistics:
        start_time = datetime.combine(start, time(00, 00, 00))
        end_time = datetime.combine(end, time(23, 59, 59, 999999))

        data = self.dao.fetch_per_day_time_report(start_time, end_time, game_id)

        data_as_dict: Dict[str, List[DailyGameTimeDto]] = {}

        for it in data:
            if it.date in data_as_dict:
                data_as_dict[it.date].append(it)
            else:
                data_as_dict[it.date] = [it]

        result: List[DayStatistics] = []
        date_range = self._generate_date_range(start, end)

        for day in date_range:
            date_str = format_date(day)

            if date_str in data_as_dict:
                games: List[GameWithTime] = []
                total_time = 0

                for el in data_as_dict[date_str]:
                    last_playtime_session_information = (
                        self.dao.fetch_last_playtime_session_information(el.game_id)
                    )
                    per_day_game_sessions_report: List[SessionInformation] = []

                    for session in self.dao.fetch_per_day_game_sessions_report(
                        date_str, el.game_id
                    ):
                        per_day_game_sessions_report.append(
                            SessionInformation(session.date, session.duration)
                        )

                    games.append(
                        GameWithTime(
                            Game(el.game_id, el.game_name),
                            el.time,
                            per_day_game_sessions_report,
                            SessionInformation(
                                date=last_playtime_session_information.date,
                                duration=last_playtime_session_information.duration,
                            ),
                        )
                    )

                    total_time += el.time

                result.append(
                    DayStatistics(date=date_str, games=games, total=total_time)
                )
            else:
                result.append(DayStatistics(date_str, [], 0))

        return PagedDayStatistics(
            data=result,
            has_prev=self.dao.is_there_is_data_before(start_time, game_id),
            has_next=self.dao.is_there_is_data_after(end_time, game_id),
        )

    def per_game_overall_statistic(self) -> List[dict[str, Any]]:
        data = self.dao.fetch_overall_playtime()
        result: List[dict[str, Any]] = []

        for g in data:
            last_playtime_session_information = (
                self.dao.fetch_last_playtime_session_information(g.game_id)
            )

            per_day_game_sessions_report: List[SessionInformation] = []

            for session in self.dao.fetch_game_sessions_report(g.game_id):
                per_day_game_sessions_report.append(
                    SessionInformation(session.date, session.duration)
                )

            game_with_time: GameWithTime = GameWithTime(
                Game(g.game_id, g.game_name),
                g.time,
                per_day_game_sessions_report,
                SessionInformation(
                    date=last_playtime_session_information.date,
                    duration=last_playtime_session_information.duration,
                ),
            )

            result.append(dataclasses.asdict(game_with_time))

        return result

    def _generate_date_range(self, start_date, end_date):
        date_list = []
        curr_date = start_date

        while curr_date <= end_date:
            date_list.append(curr_date)
            curr_date += timedelta(days=1)

        return date_list
