import { describe, expect, test } from "bun:test";
import { humanReadableTime } from "@utils/formatters";

describe("Should present play time as correct human readable text with time displayed using HOURS", () => {
	test("when zero seconds with correct plural", () => {
		expect(humanReadableTime(true, 0, false, true)).toBe("0 seconds");
	});

	test("when 1 second with correct plural", () => {
		expect(humanReadableTime(true, 1, false, true)).toBe("1 second");
	});

	test("when 34 seconds with correct plural and disabled detailed information", () => {
		expect(humanReadableTime(true, 34, false, false)).toBe("34 seconds");
	});

	test("when 47 seconds, short with correct plural and disabled detailed information", () => {
		expect(humanReadableTime(true, 47, true, false)).toBe("47s");
	});

	test("when 59 seconds with correct plural", () => {
		expect(humanReadableTime(true, 59, false, true)).toBe("59 seconds");
	});

	test("when minute without plural", () => {
		expect(humanReadableTime(true, 60 * 1, false)).toBe("1 minute");
	});

	test("when 5 minutes with plural", () => {
		expect(humanReadableTime(true, 60 * 5, false)).toBe("5 minutes");
	});

	test("when 5 minutes 15 seconds with correct plural", () => {
		expect(humanReadableTime(true, 63 * 5, false, true)).toBe(
			"5 minutes 15 seconds",
		);
	});

	test("when we have single hour and plural minutes", () => {
		expect(humanReadableTime(true, 60 * 90, false)).toBe("1 hour 30 minutes");
	});

	test("when requested short version for hour and minutes", () => {
		expect(humanReadableTime(true, 60 * 90, true)).toBe("1h 30m");
	});

	test("when requested short version for minutes", () => {
		expect(humanReadableTime(true, 60 * 5, true)).toBe("5m");
	});

	test("when 5 minutes 15 seconds short version", () => {
		expect(humanReadableTime(true, 63 * 5, true, true)).toBe("5m 15s");
	});

	test("when 5 minutes 15 seconds short version and detailed information is disabled", () => {
		expect(humanReadableTime(true, 63 * 5, true, false)).toBe("5m");
	});

	test("when 30 hours, short with no seconds", () => {
		expect(humanReadableTime(true, 30 * 60 * 60 + 150)).toBe("30h 2m");
	});

	test("when 30 hours, short with seconds", () => {
		expect(humanReadableTime(true, 30 * 60 * 60 + 150, true, true)).toBe(
			"30h 2m 30s",
		);
	});

	test("when 30 hours, short with seconds", () => {
		expect(humanReadableTime(true, 30 * 60 * 60 + 150, false, true)).toBe(
			"30 hours 2 minutes 30 seconds",
		);
	});
});

describe("Should present play time as correct human readable text with time displayed using DAYS", () => {
	test("when zero seconds with correct plural", () => {
		expect(humanReadableTime(false, 0, false, true)).toBe("0 seconds");
	});

	test("when 1 second with correct plural", () => {
		expect(humanReadableTime(false, 1, false, true)).toBe("1 second");
	});

	test("when 34 seconds with correct plural and disabled detailed information", () => {
		expect(humanReadableTime(false, 34, false, false)).toBe("34 seconds");
	});

	test("when 47 seconds, short with correct plural and disabled detailed information", () => {
		expect(humanReadableTime(false, 47, true, false)).toBe("47s");
	});

	test("when 59 seconds with correct plural", () => {
		expect(humanReadableTime(false, 59, false, true)).toBe("59 seconds");
	});

	test("when minute without plural", () => {
		expect(humanReadableTime(false, 60 * 1, false)).toBe("1 minute");
	});

	test("when 5 minutes with plural", () => {
		expect(humanReadableTime(false, 60 * 5, false)).toBe("5 minutes");
	});

	test("when 5 minutes 15 seconds with correct plural", () => {
		expect(humanReadableTime(false, 63 * 5, false, true)).toBe(
			"5 minutes 15 seconds",
		);
	});

	test("when we have single hour and plural minutes", () => {
		expect(humanReadableTime(false, 60 * 90, false)).toBe("1 hour 30 minutes");
	});

	test("when requested short version for hour and minutes", () => {
		expect(humanReadableTime(false, 60 * 90, true)).toBe("1h 30m");
	});

	test("when requested short version for minutes", () => {
		expect(humanReadableTime(false, 60 * 5, true)).toBe("5m");
	});

	test("when 5 minutes 15 seconds short version", () => {
		expect(humanReadableTime(false, 63 * 5, true, true)).toBe("5m 15s");
	});

	test("when 5 minutes 15 seconds short version and detailed information is disabled", () => {
		expect(humanReadableTime(false, 63 * 5, true, false)).toBe("5m");
	});

	test("when 30 hours, short, with no seconds", () => {
		expect(humanReadableTime(false, 30 * 60 * 60 + 150)).toBe("1d 6h 2m");
	});

	test("when 30 hours, short with seconds", () => {
		expect(humanReadableTime(false, 30 * 60 * 60 + 150, true, true)).toBe(
			"1d 6h 2m 30s",
		);
	});

	test("when 30 hours, long, with seconds", () => {
		expect(humanReadableTime(false, 30 * 60 * 60 + 150, false, true)).toBe(
			"1 day 6 hours 2 minutes 30 seconds",
		);
	});
});
