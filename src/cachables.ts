import type { Backend } from "./app/backend";
import { UpdatableCache, UpdateOnEventCache } from "./app/cache";
import type { EventBus } from "./app/system";
import { endOfWeek, minusDays, startOfWeek } from "./utils";
import { isNil } from "./utils/isNil";

export const createCachedPlayTimes = (backend: Backend, eventBus: EventBus) =>
	new UpdateOnEventCache(
		new UpdatableCache(() =>
			backend.fetchPerGameOverallStatistics().then((r) => {
				const map = new Map<string, number>();

				for (const time of r) {
					map.set(time.game.id, time.time);
				}

				return map;
			}),
		),
		eventBus,
		["CommitInterval", "TimeManuallyAdjusted"],
	);

export const createCachedLastTwoWeeksPlayTimes = (
	backend: Backend,
	eventBus: EventBus,
) =>
	new UpdateOnEventCache(
		new UpdatableCache(() => {
			const now = new Date();
			const twoWeeksAgoStart = minusDays(startOfWeek(now), 7);
			const twoWeeksAgoEnd = endOfWeek(now);

			return backend
				.fetchDailyStatisticForInterval(twoWeeksAgoStart, twoWeeksAgoEnd)
				.then((r) => {
					const map = new Map<string, number>();

					for (const time of r.data) {
						for (const game of time.games) {
							if (map.has(game.game.id)) {
								const gameTime = map.get(game.game.id);

								if (isNil(gameTime)) {
									continue;
								}

								map.set(game.game.id, gameTime + game.time);

								continue;
							}

							map.set(game.game.id, game.time);
						}
					}

					return map;
				});
		}),
		eventBus,
		["CommitInterval", "TimeManuallyAdjusted"],
	);
