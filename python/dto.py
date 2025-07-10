from dataclasses import dataclass
from python.models import Game
from typing import List


@dataclass
class AddTimeDto:
    started_at: int
    ended_at: int
    game_id: str
    game_name: str


@dataclass
class DailyStatisticsForPeriodDTO:
    start_date: str
    end_date: str
    game_id: str | None


@dataclass
class ApplyManualTimeCorrectionList:
    game: Game
    time: float


ApplyManualTimeCorrectionDTO = List[ApplyManualTimeCorrectionList]

GetGameDTO = str

GetFileSHA256DTO = str


@dataclass
class AddGameChecksumDTO:
    game_id: int
    name: str
    hash_checksum: str
    hash_algorithm: str
    hash_chunk_size: int
    hash_created_at: None | str
    hash_updated_at: None | str


RemoveGameChecksumDTO = int
