import { beforeEach, describe, expect, test } from "bun:test";
import type { GameWithTime } from "../src/app/model.ts";
import { SortBy, sortPlayedTime } from "../src/app/sortPlayTime.ts";

describe("sortPlayedTime", () => {
	let games: Array<GameWithTime>;

	beforeEach(() => {
		games = [
			{
				game: { name: "Game A", id: "0" },
				time: 30 + 45,
				sessions: [
					{ date: "2022-01-01T10:00:00Z", duration: 30 },
					{ date: "2022-01-02T10:00:00Z", duration: 45 },
				],
				last_session: { date: "2022-01-02T10:00:00Z", duration: 45 },
			},
			{
				game: { name: "Game B", id: "1" },
				time: 50,
				sessions: [{ date: "2022-03-01T08:00:00Z", duration: 50 }],
				last_session: { date: "2022-03-01T08:00:00Z", duration: 50 },
			},
			{
				game: { name: "Game C", id: "33" },
				time: 60 + 90 + 30 + 180,
				sessions: [
					{ date: "2022-02-01T09:00:00Z", duration: 60 },
					{ date: "2022-02-02T09:00:00Z", duration: 90 },
					{ date: "2022-02-03T09:00:00Z", duration: 30 },
					{ date: "2022-02-03T19:11:11Z", duration: 180 },
				],
				last_session: { date: "2022-02-03T19:11:11Z", duration: 180 },
			},
		];
	});

	test("sort by name", () => {
		const sorted = sortPlayedTime(games, SortBy.NAME.key);

		expect(sorted[0].game.name).toBe("Game A");
		expect(sorted[1].game.name).toBe("Game B");
		expect(sorted[2].game.name).toBe("Game C");
	});

	test("sort by first playtime (earliest first)", () => {
		const sorted = sortPlayedTime(games, SortBy.FIRST_PLAYTIME.key);

		expect(sorted[0].game.name).toBe("Game A");
		expect(sorted[1].game.name).toBe("Game C");
		expect(sorted[2].game.name).toBe("Game B");
	});

	test("sort by most played (time descending)", () => {
		const sorted = sortPlayedTime(games, SortBy.MOST_PLAYED.key);

		expect(sorted[0].time).toBe(60 + 90 + 30 + 180);
		expect(sorted[1].time).toBe(30 + 45);
		expect(sorted[2].time).toBe(50);
	});

	test("sort by least played (time ascending)", () => {
		const sorted = sortPlayedTime(games, SortBy.LEAST_PLAYED.key);

		expect(sorted[0].time).toBe(50);
		expect(sorted[1].time).toBe(30 + 45);
		expect(sorted[2].time).toBe(60 + 90 + 30 + 180);
	});

	test("sort by most launched (sessions descending)", () => {
		const sorted = sortPlayedTime(games, SortBy.MOST_LAUNCHED.key);

		expect(sorted[0].sessions.length).toBe(4);
		expect(sorted[1].sessions.length).toBe(2);
		expect(sorted[2].sessions.length).toBe(1);
	});

	test("sort by least launched (sessions ascending)", () => {
		const sorted = sortPlayedTime(games, SortBy.LEAST_LAUNCHED.key);

		expect(sorted[0].sessions.length).toBe(1);
		expect(sorted[1].sessions.length).toBe(2);
		expect(sorted[2].sessions.length).toBe(4);
	});

	test("sort by most average time played (time/sessions descending)", () => {
		const sorted = sortPlayedTime(games, SortBy.MOST_AVERAGE_TIME_PLAYED.key);

		// Average time: Game A -> 100 / 3 = 33.33, Game B -> 50 / 2 = 25, Game C -> 150 / 4 = 37.5
		expect(sorted[0].time / sorted[0].sessions.length).toBeGreaterThan(
			sorted[1].time / sorted[1].sessions.length,
		);

		expect(sorted[0].time / sorted[0].sessions.length).toBeGreaterThan(
			sorted[2].time / sorted[2].sessions.length,
		);
	});

	test("sort by least average time played (time/sessions ascending)", () => {
		const sorted = sortPlayedTime(games, SortBy.LEAST_AVERAGE_TIME_PLAYED.key);

		// Average time: Game A -> 33.33, Game B -> 25, Game C -> 37.5
		expect(sorted[0].time / sorted[0].sessions.length).toBeLessThan(
			sorted[1].time / sorted[1].sessions.length,
		);
		expect(sorted[0].time / sorted[0].sessions.length).toBeLessThan(
			sorted[2].time / sorted[2].sessions.length,
		);
	});

	test("default sorting is by most played", () => {
		const sorted = sortPlayedTime(games, "nonExistentSortKey" as any); // Pass an invalid sort key.

		expect(sorted[0].time).toBe(60 + 90 + 30 + 180);
		expect(sorted[1].time).toBe(30 + 45);
		expect(sorted[2].time).toBe(50);
	});
});
