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

type ApplyManualTimeCorrectionDTO = ApplyManualTimeCorrectionList[];

type GetGameDTO = string;

type GetFileSHA256DTO = string;

interface AddGameChecksumDTO {
	game_id: string;
	hash_checksum: string;
	hash_algorithm: string;
	hash_chunk_size: number;
	hash_created_at?: string;
	hash_updated_at?: string;
}

interface RemoveGameChecksumDTO {
	game_id: string;
	checksum: string;
}

type RemoveAllGameChecksumsDTO = string;
