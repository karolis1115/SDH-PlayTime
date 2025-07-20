from time import process_time
import dataclasses
from collections import defaultdict
from datetime import datetime, date, time, timedelta
from typing import Dict, List, Any, Optional
from python.db.dao import DailyGameTimeDto, Dao, GameTimeDto
from python.helpers import format_date
from python.schemas.response import (
    DayStatistics,
    Game,
    GameWithTime,
    SessionInformation,
    PagedDayStatistics,
)
from dataclasses import dataclass


@dataclass
class PlayTimeWithHash:
    game_id: str
    checksum: Optional[str]


class Statistics:
    dao: Dao

    def __init__(self, dao: Dao) -> None:
        self.dao = dao

    def combine_games_by_checksum_per_day(
        self, days: List[DayStatistics]
    ) -> List[DayStatistics]:
        """
        Combines games played on the same day that share the same file checksum.
        This version is slightly cleaner and adds comments on its assumptions.
        """
        result_days = []

        for day in days:
            # Group games by checksum for the current day
            checksum_to_games: Dict[Optional[str], List[GameWithTime]] = defaultdict(
                list
            )
            for gwt in day.games:
                # Assumption: The checksum of the first session is representative
                # for the purpose of grouping. Handle cases with no sessions.
                checksum = gwt.sessions[0].checksum if gwt.sessions else None
                checksum_to_games[checksum].append(gwt)

            merged_games: List[GameWithTime] = []
            for checksum, game_group in checksum_to_games.items():
                # If checksum is None or only one game has it, no merging is needed
                if checksum is None or len(game_group) == 1:
                    merged_games.extend(game_group)
                    continue

                # Merge multiple games with the same checksum
                # Assumption: The game identity (name, id) of the first game in the
                # group is used for the merged entry.
                representative_game = game_group[0]

                total_time = sum(g.time for g in game_group)

                all_sessions = [s for g in game_group for s in g.sessions]
                all_sessions.sort(key=lambda s: s.date, reverse=True)

                merged_games.append(
                    GameWithTime(
                        game=representative_game.game,
                        time=total_time,
                        sessions=all_sessions,
                        # Last session is kept from the representative game
                        last_session=representative_game.last_session,
                    )
                )

            # Re-calculate total time for the day after merging
            total_day_time = sum(gwt.time for gwt in merged_games)
            result_days.append(
                DayStatistics(date=day.date, games=merged_games, total=total_day_time)
            )

        return result_days

    def daily_statistics_for_period(
        self, start: date, end: date, game_id: Optional[str] = None
    ) -> PagedDayStatistics:
        """
        Returns daily statistics, optimized to avoid N+1 queries.
        """
        general_start = process_time()
        start_time = datetime.combine(start, time.min)
        end_time = datetime.combine(end, time.max)

        # 1. Initial fetch: Get aggregated time per game per day. This is efficient.
        daily_reports = self.dao.fetch_per_day_time_report(
            start_time, end_time, game_id
        )

        # Collect all unique game IDs from the reports
        game_ids_in_period = {report.game_id for report in daily_reports}

        # --- Bulk Data Fetching (Replaces N+1 queries) ---

        # 2. Fetch ALL sessions for ALL relevant games in the period in ONE query.
        sessions_by_day_and_game = self.dao.fetch_sessions_for_period(
            start_time, end_time, game_id
        )

        # 3. Fetch the single LATEST session for ALL relevant games in ONE query.
        last_sessions_map = self.dao.fetch_last_sessions_for_games(game_ids_in_period)

        # --- Data Processing (In-memory) ---

        # Group reports by date for easier processing
        reports_by_date: Dict[str, List[DailyGameTimeDto]] = defaultdict(list)
        for report in daily_reports:
            reports_by_date[report.date].append(report)

        result_days: List[DayStatistics] = []
        for day in self._generate_date_range(start, end):
            date_str = format_date(day)

            day_games: List[GameWithTime] = []
            total_day_time = 0.0

            # Loop through games reported for this day
            for report in reports_by_date.get(date_str, []):
                # Retrieve pre-fetched data from our lookups (fast, no DB call)
                game_sessions = sessions_by_day_and_game.get(date_str, {}).get(
                    report.game_id, []
                )
                last_session = last_sessions_map.get(report.game_id)

                day_games.append(
                    GameWithTime(
                        game=Game(report.game_id, report.game_name),
                        time=report.time,
                        sessions=game_sessions,
                        last_session=last_session,
                    )
                )
                total_day_time += report.time

            result_days.append(
                DayStatistics(date=date_str, games=day_games, total=total_day_time)
            )

        # The final combination and pagination steps remain the same
        combined_data = self.combine_games_by_checksum_per_day(result_days)

        has_prev = self.dao.is_there_is_data_before(start_time, game_id)
        has_next = self.dao.is_there_is_data_after(end_time, game_id)

        return PagedDayStatistics(
            data=combined_data,
            has_prev=has_prev,
            has_next=has_next,
        )

    def get_last_sessions_from_grouped_sessions(
        self, sessions_by_checksum: Dict[str, List[SessionInformation]]
    ) -> Dict[str, SessionInformation]:
        """
        Gets the last session for each checksum from the grouped sessions.
        Returns a dictionary mapping checksum to the most recent SessionInformation based on date.
        """
        last_sessions_by_checksum: Dict[str, SessionInformation] = {}

        for checksum, sessions in sessions_by_checksum.items():
            if sessions:
                last_session = max(
                    sessions,
                    key=lambda s: datetime.fromisoformat(s.date.replace("Z", "+00:00")),
                )
                last_sessions_by_checksum[checksum] = last_session

        return last_sessions_by_checksum

    def per_game_overall_statistic(self) -> List[Dict[str, Any]]:
        """
        Returns overall statistics per game, grouped by checksum (or game_id if checksum is missing).
        """
        data = self.dao.fetch_overall_playtime()
        all_sessions = self.dao.fetch_all_game_sessions_report()

        games_by_key: Dict[str, List[GameTimeDto]] = defaultdict(list)

        for game_stat in data:
            key = game_stat.checksum or game_stat.game_id
            games_by_key[key].append(game_stat)

        sessions_by_key: Dict[str, List[SessionInformation]] = defaultdict(list)

        for game_id, session in all_sessions:
            key = session.checksum or game_id
            sessions_by_key[key].append(
                SessionInformation(
                    date=session.date,
                    duration=session.duration,
                    migrated=session.migrated,
                    checksum=session.checksum,
                )
            )

        # Get last session per group
        last_sessions_by_key = self.get_last_sessions_from_grouped_sessions(
            sessions_by_key
        )

        result: List[Dict[str, Any]] = []

        for key, game_stats in games_by_key.items():
            first_game = game_stats[0]
            total_time = sum(g.time for g in game_stats)
            sessions = sessions_by_key.get(key, [])
            last_session = last_sessions_by_key.get(key)

            # Fallback to game_id if last_session is missing
            if last_session is None:
                last_session = last_sessions_by_key.get(first_game.game_id)

            game_with_time = GameWithTime(
                game=Game(first_game.game_id, first_game.game_name),
                time=total_time,
                sessions=sessions,
                last_session=last_session,
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
