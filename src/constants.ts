export const APP_TYPE = {
	THIRD_PARTY: 1073741824,
} as const;

export const BACK_END_API = {
	ADD_TIME: "add_time",
	DAILY_STATISTICS_FOR_PERIOD: "daily_statistics_for_period",
	PER_GAME_OVERALL_STATISTICS: "per_game_overall_statistics",
	FETCH_PLAYTIME_INFORMATION: "fetch_playtime_information",
	PER_GAME_OVERALL_STATISTICS_SHORT: "per_game_overall_statistics_short",
	APPLY_MANUAL_TIME_CORRECTION: "apply_manual_time_correction",
	GET_GAME: "get_game",
	HAS_MIN_REQUIRED_PYTHON_VERSION: "has_min_required_python_version",
	GET_FILE_SHA256: "get_file_sha256",
	GET_GAMES_DICTIONARY: "get_games_dictionary",
	SAVE_GAME_CHECKSUM: "save_game_checksum",
	REMOVE_GAME_CHECKSUM: "remove_game_checksum",
	REMOVE_ALL_GAME_CHECKSUM: "remove_all_game_checksum",
	GET_GAMES_CHECKSUM: "get_games_checksum",
	GET_STATISTICS_FOR_LAST_TWO_WEEKS: "statistics_for_last_two_weeks",
	SAVE_GAME_CHECKSUM_BULK: "save_game_checksum_bulk",
	REMOVE_ALL_CHECKSUMS: "remove_all_checksums",
	LINK_GAME_TO_GAME_WITH_CHECKSUM: "link_game_to_game_with_checksum",
} as const;
