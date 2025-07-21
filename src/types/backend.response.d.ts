type GameResponse = {
	id: string;
	name: string;
};

type SessionInformationResponse = {
	date: string;
	duration: number;
	migrated?: string;
	checksum?: string;
};

type GameWithTimeResponse = {
	game: Game;
	time: number;
	sessions: Array<SessionInformation>;
	last_session?: SessionInformation;
};

type DayStatisticsResponse = {
	date: string;
	games: Array<GameWithTime>;
	total: number;
};

type PagedDayStatisticsResponse = {
	data: Array<DayStatisticsResponse>;
	has_prev: boolean;
	has_next: boolean;
};

type GameInformationResponse = {
	game: Game;
	time: number;
};

type FileChecksumResponse = {
	game_id: string;
	checksum: string;
	algorithm: string;
	chunk_size: number;
	created_at?: string;
	updated_at?: string;
};

type GameDictionaryResponse = {
	game: Game;
	files_checksum: Array<FileChecksumResponse>;
};

type GamesChecksumResponse = {
	game_id: string;
	checksum: string;
};
