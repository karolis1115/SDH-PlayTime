import dataclasses
from collections import defaultdict
from datetime import datetime, date, time, timedelta
from typing import Dict, List, Any, Optional
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
        self, start: date, end: date, game_id: Optional[str] = None
    ) -> PagedDayStatistics:
        """
        Returns daily statistics for a given period and optional game_id.
        """
        start_time = datetime.combine(start, time.min)
        end_time = datetime.combine(end, time.max)

        # Fetch all per-day time reports in one go
        daily_reports: List[DailyGameTimeDto] = self.dao.fetch_per_day_time_report(
            start_time, end_time, game_id
        )

        # Group reports by date string
        reports_by_date: Dict[str, List[DailyGameTimeDto]] = defaultdict(list)

        for report in daily_reports:
            reports_by_date[report.date].append(report)

        result: List[DayStatistics] = []

        for day in self._generate_date_range(start, end):
            date_str = format_date(day)
            games: List[GameWithTime] = []
            total_time = 0.0

            for report in reports_by_date.get(date_str, []):
                # Fetch last session info (could be optimized if needed)
                last_session = self.dao.fetch_last_playtime_session_information(
                    report.game_id
                )

                # Fetch all sessions for this game and day
                sessions = [
                    SessionInformation(session.date, session.duration, session.migrated)
                    for session in self.dao.fetch_per_day_game_sessions_report(
                        date_str, report.game_id
                    )
                ]

                games.append(
                    GameWithTime(
                        game=Game(report.game_id, report.game_name),
                        time=report.time,
                        sessions=sessions,
                        last_session=SessionInformation(
                            date=last_session.date,
                            duration=last_session.duration,
                            migrated=last_session.migrated,
                        ),
                    )
                )
                total_time += report.time

            result.append(DayStatistics(date=date_str, games=games, total=total_time))

        return PagedDayStatistics(
            data=result,
            has_prev=self.dao.is_there_is_data_before(start_time, game_id),
            has_next=self.dao.is_there_is_data_after(end_time, game_id),
        )

    def per_game_overall_statistic(self) -> List[Dict[str, Any]]:
        """
        Returns overall statistics per game, including sessions and last session info.
        """
        data = self.dao.fetch_overall_playtime()
        result: List[Dict[str, Any]] = []

        for game_stat in data:
            # Fetch last session info
            last_session = self.dao.fetch_last_playtime_session_information(
                game_stat.game_id
            )

            # Fetch all sessions for this game
            sessions = [
                SessionInformation(session.date, session.duration, session.migrated)
                for session in self.dao.fetch_game_sessions_report(game_stat.game_id)
            ]

            game_with_time = GameWithTime(
                game=Game(game_stat.game_id, game_stat.game_name),
                time=game_stat.time,
                sessions=sessions,
                last_session=SessionInformation(
                    date=last_session.date,
                    duration=last_session.duration,
                    migrated=last_session.migrated,
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
