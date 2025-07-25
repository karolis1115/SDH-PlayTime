from dataclasses import dataclass
from typing import List


@dataclass
class Game:
    id: str
    name: str


@dataclass
class SessionInformation:
    date: str
    duration: float
    migrated: str | None
    checksum: str | None


@dataclass
class GameWithTime:
    game: Game
    time: float
    sessions: List[SessionInformation]
    last_session: SessionInformation | None


@dataclass
class DayStatistics:
    date: str
    games: List[GameWithTime]
    total: float


@dataclass
class PagedDayStatistics:
    data: List[DayStatistics]
    has_prev: bool
    has_next: bool


@dataclass
class GameInformation:
    game: Game
    time: float


@dataclass
class FileChecksum:
    game_id: str
    checksum: str
    algorithm: str
    chunk_size: int
    created_at: None | str
    updated_at: None | str


@dataclass
class GameDictionary:
    game: Game
    files_checksum: List[FileChecksum]


# TODO: Use `GameDictionary` instead of this
@dataclass
class GamesChecksum:
    game_id: str
    checksum: str


@dataclass
class PlaytimeInformation:
    game_id: str
    total_time: float
    last_played_date: str
    game_name: str
    aliases_id: str | None
