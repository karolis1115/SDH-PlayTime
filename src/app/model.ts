export { convertDailyStatisticsToGameWithTime };

function convertDailyStatisticsToGameWithTime(
	data: DailyStatistics[],
): GameWithTime[] {
	const result: GameWithTime[] = [];

	for (const day of data) {
		for (const game of day.games) {
			const found = result.find((g) => g.game.id === game.game.id);

			if (found) {
				found.time += game.time;
				found.sessions = [...found.sessions, ...game.sessions];

				continue;
			}

			result.push({
				...game,
				sessions: [...game.sessions],
			});
		}
	}

	return result;
}
