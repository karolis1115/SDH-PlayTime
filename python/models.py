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
    hasPrev: bool
    hasNext: bool


@dataclass
class GameInformation:
    id: str
    name: str
    time: float


@dataclass
class GameDictionary:
    id: str
    name: str
    checksum: None | str
