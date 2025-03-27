import { call } from "@decky/api";
import logger from "../utils";
import { toIsoDateOnly } from "./formatters";
import type { EventBus } from "./system";

export interface OverallPlayTimes {
	[gameId: string]: number;
}

export interface StatisticForIntervalResponse {
	data: DailyStatistics[];
	hasPrev: boolean;
	hasNext: boolean;
}

export class Backend {
	private eventBus: EventBus;

	public static dataDirectoryPath: Nullable<string> = undefined;

	constructor(eventBus: EventBus) {
		this.eventBus = eventBus;

		eventBus.addSubscriber(async (event) => {
			switch (event.type) {
				case "CommitInterval":
					await this.addTime(event.startedAt, event.endedAt, event.game);
					break;

				case "TimeManuallyAdjusted":
					break;
			}
		});

		Backend.getDataDirectory()
			.then((response) => {
				Backend.dataDirectoryPath = response;
			})
			.catch((error) => logger.error(error));
	}

	private async addTime(startedAt: number, endedAt: number, game: Game) {
		const MIN_SECONDS = 5;
		const playTimeInSeconds = (endedAt - startedAt) / 1000;

		if (playTimeInSeconds < MIN_SECONDS) {
			logger.info(
				`Session ignored because play time iss less than ${MIN_SECONDS}. Current play time: ${playTimeInSeconds}`,
			);

			return;
		}

		await call<
			[
				started_at: number,
				ended_at: number,
				game_id: string,
				game_name: string,
			],
			void
		>("add_time", startedAt / 1000, endedAt / 1000, game.id, game.name).catch(
			() => {
				this.errorOnBackend(
					"Can't save interval, because of backend error (add_time)",
				);
			},
		);
	}

	async fetchDailyStatisticForInterval(
		start: Date,
		end: Date,
		gameId?: string,
	): Promise<StatisticForIntervalResponse> {
		return await call<
			[start_date: string, end_date: string, gameId?: string],
			StatisticForIntervalResponse
		>(
			"daily_statistics_for_period",
			toIsoDateOnly(start),
			toIsoDateOnly(end),
			gameId,
		)
			.then((response) => {
				return response;
			})
			.catch((error) => {
				logger.error(error);

				return {
					hasNext: false,
					hasPrev: false,
					data: [],
				} as StatisticForIntervalResponse;
			});
	}

	async fetchPerGameOverallStatistics(): Promise<GameWithTime[]> {
		return await call<[], GameWithTime[]>("per_game_overall_statistics")
			.then((response) => {
				return response;
			})
			.catch((error) => {
				logger.error(error);

				return [];
			});
	}

	async applyManualOverallTimeCorrection(
		games: GameWithTime[],
	): Promise<boolean> {
		return await call<[list_of_game_stats: GameWithTime[]], void>(
			"apply_manual_time_correction",
			games,
		)
			.then(() => {
				this.eventBus.emit({ type: "TimeManuallyAdjusted" });

				return true;
			})
			.catch((error) => {
				logger.error(error);

				return false;
			});
	}

	private errorOnBackend(message: string) {
		logger.error(`There is an error: ${message}`);

		this.eventBus.emit({
			type: "NotifyAboutError",
			message: message,
		});
	}

	async getGame(gameId: string): Promise<Nullable<GameInformation>> {
		return await call<[gameId: string], Nullable<GameInformation>>(
			"get_game",
			gameId,
		)
			.then((response) => {
				return response;
			})
			.catch((error) => {
				logger.error(error);

				return null;
			});
	}

	public static async getFileSHA256(path: string): Promise<Nullable<string>> {
		return await call<[path: string], Nullable<string>>("get_file_sha256", path)
			.then((response) => {
				return response;
			})
			.catch((error) => {
				logger.error(error);

				return undefined;
			});
	}

	public static async getHasMinRequiredPythonVersion(): Promise<boolean> {
		return await call<[], boolean>("has_min_required_python_version")
			.then((response) => {
				return response;
			})
			.catch((error) => {
				logger.error(error);

				return false;
			});
	}

	public static async getDataDirectory(): Promise<Nullable<string>> {
		return await call<[], string>("get_data_directory")
			.then((response) => {
				return response;
			})
			.catch((error) => {
				logger.error(error);

				return undefined;
			});
	}
}
