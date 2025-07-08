type Game = {
	id: string;
	name: string;
};

type SessionInformation = {
	date: string;
	duration: number;
};

type GameWithTimeResponse = {
	game: Game;
	time: number;
	sessions: SessionInformation[];
	last_session: SessionInformation;
};

type DayStatistics = {
	date: string;
	games: GameWithTime[];
	total: number;
};

type PagedDayStatisticsResponse = {
	data: DayStatistics[];
	has_prev: boolean;
	has_next: boolean;
};

type GameInformationResponse = {
	id: string;
	name: string;
	time: number;
};

type GameDictionaryResponse = {
	id: string;
	name: string;
	hash_checksum?: string;
	hash_algorithm?: string;
	hash_chunk_size?: number;
	hash_created_at?: string;
	hash_updated_at?: string;
};
