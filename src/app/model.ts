export { convertDailyStatisticsToGameWithTime };

function convertDailyStatisticsToGameWithTime(
	data: DailyStatistics[],
): GamePlaytimeDetails[] {
	const result: GamePlaytimeDetails[] = [];

	for (const day of data) {
		for (const game of day.games) {
			const found = result.find((g) => g.game.id === game.game.id);

			if (found) {
				found.totalTime += game.totalTime;
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
