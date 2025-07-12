type Game = {
	id: string;
	name: string;
};

type SessionInformation = {
	date: string;
	duration: number;
	migrated?: string;
};

type GameWithTimeResponse = {
	game: Game;
	time: number;
	sessions: Array<SessionInformation>;
	last_session: SessionInformation;
};

type DayStatistics = {
	date: string;
	games: Array<GameWithTime>;
	total: number;
};

type PagedDayStatisticsResponse = {
	data: Array<DayStatistics>;
	has_prev: boolean;
	has_next: boolean;
};

type GameInformationResponse = {
	id: string;
	name: string;
	time: number;
};

type FileChecksumResponse = {
	checksum: string;
	algorithm: string;
	chunk_size: number;
	created_at?: string;
	updated_at?: string;
};

type GameDictionaryResponse = {
	id: string;
	name: string;
	files_checksum: Array<FileChecksumResponse>;
};
