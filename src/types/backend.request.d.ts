type AddTimeDTO = {
	started_at: number;
	ended_at: number;
	game_id: string;
	game_name: string;
};

type DailyStatisticsForPeriodDTO = {
	start_date: string;
	end_date: string;
	game_id?: string;
};

type ApplyManualTimeCorrection = {
	game: Game;
	time: number;
};

type ApplyManualTimeCorrectionDTO = ApplyManualTimeCorrection[];

type GetGameDTO = string;

type GetFileSHA256DTO = string;

type AddGameChecksumDTO = {
	game_id: string;
	checksum: string;
	algorithm: string;
	chunk_size: number;
	created_at?: Date;
	updated_at?: Date;
};

type RemoveGameChecksumDTO = {
	game_id: string;
	checksum: string;
};

type RemoveAllGameChecksumsDTO = string;
