interface AddTimeDto {
	started_at: number;
	ended_at: number;
	game_id: string;
	game_name: string;
}

interface DailyStatisticsForPeriodDTO {
	start_date: string;
	end_date: string;
	game_id?: string;
}

interface ApplyManualTimeCorrectionList {
	game: Game;
	time: number;
}

type ApplyManualTimeCorrectionDTO = Array<ApplyManualTimeCorrectionList>;

type GetGameDTO = [gameId: string];

type GetFileSHA256DTO = [path: string];

interface AddGameChecksumDTO {
	game_id: string;
	checksum: string;
	algorithm: string;
	chunk_size: number;
	created_at?: Date;
	updated_at?: Date;
}

interface RemoveGameChecksumDTO {
	game_id: string;
	checksum: string;
}

type RemoveAllGameChecksumsDTO = [gameId: string];
