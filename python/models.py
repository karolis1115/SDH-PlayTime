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


@dataclass
class GameWithTime:
    game: Game
    time: int
    sessions: List[SessionInformation]
    last_session: SessionInformation


@dataclass
class DayStatistics:
    date: str
    games: List[GameWithTime]
    total: int


@dataclass
class PagedDayStatistics:
    data: List[DayStatistics]
    has_prev: bool
    has_next: bool


@dataclass
class GameInformation:
    id: str
    name: str
    time: float


@dataclass
class FileChecksum:
    checksum: str
    algorithm: str
    chunk_size: int
    created_at: None | str
    updated_at: None | str


@dataclass
class GameDictionary:
    id: str
    name: str
    files_checksum: List[FileChecksum]
