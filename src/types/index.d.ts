declare module "*.css";

type Nullable<T> = T | null | undefined;

type Game = GameResponse;

type SessionInformation = SessionInformationResponse;

type Session = SessionInformation & {
	migrated?: string;
};

type DailyStatistics = DayStatisticsResponse;

type GameWithTime = Omit<GameWithTimeResponse, "last_session"> & {
	lastSession?: SessionInformation;
};

type FileChecksum = Omit<
	FileChecksumResponse,
	"game_id" | "chunk_size" | "created_at" | "updated_at"
> & {
	gameId: string;
	createdAt?: string;
	updatedAt?: string;
};

type GameDictionary = Omit<GameDictionaryResponse, "files_checksum"> & {
	filesChecksum: Array<FileChecksum>;
};

type GameInformation = GameInformationResponse;

type PagedDayStatistics = Omit<
	PagedDayStatisticsResponse,
	"has_prev" | "has_next"
> & {
	hasPrev: boolean;
	hasNext: boolean;
};

type LocalNonSteamGame = {
	id: string;
	name: string;
	sha256: string;
	pathToGame: string;
};

type GamesChecksum = Omit<GamesChecksumResponse, "game_id"> & {
	gameId: string;
};
