import { describe, expect, test } from "bun:test";
import { SessionPlayTime } from "../src/app/SessionPlayTime";
import { EventBus } from "../src/app/system";

const gameInfo_01: Game = {
	id: "1",
	name: "Game name 001",
};

const gameInfo_02: Game = {
	id: "2",
	name: "Game name 002",
};

describe("SessionPlayTime should calculate time", () => {
	test("Should calculate ", () => {
		const eventBus = new EventBus();
		const sessionPlayTime = new SessionPlayTime(eventBus);

		eventBus.emit({
			type: "GameStarted",
			createdAt: 0,
			game: gameInfo_01,
		});

		expect(sessionPlayTime.getPlayTime(1000 * 60 * 5)).toEqual([
			{
				gameName: "Game name 001",
				playTime: 300,
			},
		]);
	});

	test("should ignore interval of game_01, when we received game start event game_02 without ending game_01 event ", () => {
		const eventBus = new EventBus();
		const sessionPlayTime = new SessionPlayTime(eventBus);

		eventBus.emit({
			type: "GameStarted",
			createdAt: 0,
			game: gameInfo_01,
		});

		eventBus.emit({
			type: "GameStarted",
			createdAt: 1000 * 60 * 2,
			game: gameInfo_02,
		});

		expect(sessionPlayTime.getPlayTime(1000 * 60 * 5)).toEqual([
			{
				gameName: "Game name 001",
				playTime: 300,
			},
			{
				gameName: "Game name 002",
				playTime: 180,
			},
		]);
	});
});

describe("SessionPlayTime should send commit interval", () => {
	test("when we received games start and game end events sequentially", () => {
		const eventBus = new EventBus();
		// @ts-ignore
		const _sessionPlayTime = new SessionPlayTime(eventBus);

		let committedInterval: unknown;

		eventBus.addSubscriber((event) => {
			switch (event.type) {
				case "CommitInterval":
					committedInterval = {
						type: event.type,
						startedAt: event.startedAt,
						endedAt: event.endedAt,
						game: event.game,
					};
					break;
			}
		});

		eventBus.emit({
			type: "GameStarted",
			createdAt: 0,
			game: gameInfo_01,
		});

		eventBus.emit({
			type: "GameStopped",
			createdAt: 50,
			game: gameInfo_01,
		});

		expect(committedInterval).toStrictEqual({
			type: "CommitInterval",
			startedAt: 0,
			endedAt: 50,
			game: gameInfo_01,
		});
	});

	test("when we received Suspend and ResumeFromSuspend events sequentially, Interval should be deleted", () => {
		const eventBus = new EventBus();
		const sessionPlayTime = new SessionPlayTime(eventBus);

		let committedInterval: unknown;

		eventBus.addSubscriber((event) => {
			switch (event.type) {
				case "CommitInterval":
					committedInterval = {
						type: event.type,
						startedAt: event.startedAt,
						endedAt: event.endedAt,
						game: event.game,
					};
					break;
			}
		});

		eventBus.emit({
			type: "GameStarted",
			createdAt: 0,
			game: gameInfo_01,
		});

		eventBus.emit({
			type: "Suspended",
			createdAt: 5 * 1000 * 60,
			game: gameInfo_01,
		});

		expect(committedInterval).toStrictEqual({
			type: "CommitInterval",
			startedAt: 0,
			endedAt: 5 * 1000 * 60,
			game: gameInfo_01,
		});

		eventBus.emit({
			type: "ResumeFromSuspend",
			createdAt: 10 * 1000 * 60,
			game: gameInfo_01,
		});

		expect(sessionPlayTime.getPlayTime(11 * 1000 * 60)).toEqual([
			{
				gameName: "Game name 001",
				playTime: 60,
			},
		]);
	});
});
