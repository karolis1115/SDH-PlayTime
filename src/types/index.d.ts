declare module "*.css";

type Nullable<T> = T | null | undefined;

type Session = SessionInformation & {
	migrated?: string;
};
type DailyStatistics = DayStatistics;

type GameWithTime = Omit<GameWithTimeResponse, "last_session"> & {
	lastSession: SessionInformation;
};

type FileChecksum = {
	checksum: string;
	algorithm: string;
	chunkSize: number;
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
