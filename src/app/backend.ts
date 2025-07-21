import { call } from "@decky/api";
import logger from "@src/utils/logger";
import { toIsoDateOnly } from "@utils/formatters";
import type { EventBus } from "./system";
import { BACK_END_API } from "@src/constants";

export interface OverallPlayTimes {
	[gameId: string]: number;
}

export class Backend {
	private eventBus: EventBus;

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

		await call<[AddTimeDTO], void>(BACK_END_API.ADD_TIME, {
			started_at: startedAt / 1000,
			ended_at: endedAt / 1000,
			game_id: game.id,
			game_name: game.name,
		}).catch(() => {
			this.errorOnBackend(
				"Can't save interval, because of backend error (add_time)",
			);
		});
	}

	async fetchDailyStatisticForInterval(
		start: Date,
		end: Date,
		gameId?: string,
	): Promise<PagedDayStatistics> {
		return await call<
			[DailyStatisticsForPeriodDTO],
			PagedDayStatisticsResponse
		>(BACK_END_API.DAILY_STATISTICS_FOR_PERIOD, {
			start_date: toIsoDateOnly(start),
			end_date: toIsoDateOnly(end),
			game_id: gameId,
		})
			.then((response) => {
				return {
					...response,
					hasNext: response.has_next,
					hasPrev: response.has_prev,
				};
			})
			.catch((error) => {
				logger.error(error);

				return {
					hasNext: false,
					hasPrev: false,
					data: [],
				} as PagedDayStatistics;
			});
	}

	async fetchPerGameOverallStatistics(): Promise<GameWithTime[]> {
		return await call<[], Array<GameWithTimeResponse>>(
			BACK_END_API.PER_GAME_OVERALL_STATISTICS,
		)
			.then((response) => {
				return response.map((item) => ({
					...item,
					lastSession: item.last_session,
				}));
			})
			.catch((error) => {
				logger.error(error);

				return [];
			});
	}

	async applyManualOverallTimeCorrection(
		games: GameWithTime[],
	): Promise<boolean> {
		return await call<[list_of_game_stats: ApplyManualTimeCorrectionDTO], void>(
			BACK_END_API.APPLY_MANUAL_TIME_CORRECTION,
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
		return await call<[GetGameDTO], Nullable<GameInformationResponse>>(
			BACK_END_API.GET_GAME,
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
		return await call<[GetFileSHA256DTO], Nullable<string>>(
			BACK_END_API.GET_FILE_SHA256,
			path,
		)
			.then((response) => {
				return response;
			})
			.catch((error) => {
				logger.error(error);

				return undefined;
			});
	}

	public static async getGamesDictionary(): Promise<Array<GameDictionary>> {
		return await call<[], Array<GameDictionaryResponse>>(
			BACK_END_API.GET_GAMES_DICTIONARY,
		).then((response) => {
			return response.map((item) => ({
				...item,
				filesChecksum: item.files_checksum.map((fileChecksum) => ({
					...fileChecksum,
					gameId: fileChecksum.game_id,
					chunkSize: fileChecksum.chunk_size,
					createdAt: fileChecksum.created_at,
					updatedAt: fileChecksum.updated_at,
				})),
			}));
		});
	}

	public static async addGameChecksum(
		id: string,
		hashChecksum: string,
		hashAlgorithm: string,
		hashChunkSize: number,
		createdAt?: Date,
		updatedAt?: Date,
	): Promise<void> {
		return await call<[AddGameChecksumDTO], void>(
			BACK_END_API.SAVE_GAME_CHECKSUM,
			{
				game_id: id,
				checksum: hashChecksum,
				algorithm: hashAlgorithm,
				chunk_size: hashChunkSize,
				created_at: createdAt,
				updated_at: updatedAt,
			},
		);
	}

	public static async removeGameChecksum(
		id: string,
		checksum: string,
	): Promise<void> {
		return await call<[RemoveGameChecksumDTO], void>(
			BACK_END_API.REMOVE_GAME_CHECKSUM,
			{
				game_id: id,
				checksum,
			},
		);
	}

	public static async getGamesChecksum(): Promise<Array<GamesChecksum>> {
		return await call<[], Array<FileChecksumResponse>>(
			BACK_END_API.GET_GAMES_CHECKSUM,
		).then((response) =>
			response.map((item) => ({ ...item, gameId: item.game_id })),
		);
	}
}
