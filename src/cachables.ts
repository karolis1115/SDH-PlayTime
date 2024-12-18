import type { Backend } from "./app/backend";
import { UpdatableCache, UpdateOnEventCache } from "./app/cache";
import type { EventBus } from "./app/system";
import { endOfWeek, minusDays, startOfWeek } from "./utils";

export const createCachedPlayTimes = (backend: Backend, eventBus: EventBus) =>
	new UpdateOnEventCache(
		new UpdatableCache(() =>
			backend.fetchPerGameOverallStatistics().then((r) => {
				const map = new Map<string, number>();
				r.forEach((time) => {
					map.set(time.game.id, time.time);
				});
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
					r.data.forEach((time) => {
						time.games.forEach((game) => {
							if (map.has(game.game.id)) {
								map.set(game.game.id, map.get(game.game.id)! + game.time);
							} else {
								map.set(game.game.id, game.time);
							}
						});
					});
					return map;
				});
		}),
		eventBus,
		["CommitInterval", "TimeManuallyAdjusted"],
	);
