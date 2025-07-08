declare module "*.css";

type Nullable<T> = T | null | undefined;

type Session = SessionInformation & {
	migrated?: string;
};
type DailyStatistics = DayStatistics;

type GameWithTime = Omit<GameWithTimeResponse, "last_session"> & {
	lastSession: SessionInformation;
};

type GameDictionary = Omit<
	GameDictionaryResponse,
	| "hash_checksum"
	| "hash_algorithm"
	| "hash_chunk_size"
	| "hash_created_at"
	| "hash_updated_at"
> & {
	hashChecksum?: string;
	hashAlgorithm?: string;
	hashChunkSize?: number;
	hashCreatedAt?: string;
	hashUpdatedAt?: string;
};

type GameInformation = GameInformationResponse;

type PagedDayStatistics = Omit<
	PagedDayStatisticsResponse,
	"has_prev" | "has_next"
> & {
	hasPrev: boolean;
	hasNext: boolean;
};
