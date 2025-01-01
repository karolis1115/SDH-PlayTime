import { humanReadableTime } from "../src/app/formatters";

describe("Should present play time as correct human readable text", () => {
	test("when zero seconds with correct plural", () => {
		expect(humanReadableTime(0, false, true)).toBe("0 seconds");
	});

	test("when 1 second with correct plural", () => {
		expect(humanReadableTime(1, false, true)).toBe("1 second");
	});

	test("when 34 seconds with correct plural and disabled detailed information", () => {
		expect(humanReadableTime(34, false, false)).toBe("34 seconds");
	});

	test("when 47 seconds, short with correct plural and disabled detailed information", () => {
		expect(humanReadableTime(47, true, false)).toBe("47s");
	});

	test("when 59 seconds with correct plural", () => {
		expect(humanReadableTime(59, false, true)).toBe("59 seconds");
	});

	test("when minute without plural", () => {
		expect(humanReadableTime(60 * 1, false)).toBe("1 minute");
	});

	test("when 5 minutes with plural", () => {
		expect(humanReadableTime(60 * 5, false)).toBe("5 minutes");
	});

	test("when 5 minutes 15 seconds with correct plural", () => {
		expect(humanReadableTime(63 * 5, false, true)).toBe("5 minutes 15 seconds");
	});

	test("when we have single hour and plural minutes", () => {
		expect(humanReadableTime(60 * 90, false)).toBe("1 hour 30 minutes");
	});

	test("when requested short version for hour and minutes", () => {
		expect(humanReadableTime(60 * 90, true)).toBe("1h 30m");
	});

	test("when requested short version for minutes", () => {
		expect(humanReadableTime(60 * 5, true)).toBe("5m");
	});

	test("when 5 minutes 15 seconds short version", () => {
		expect(humanReadableTime(63 * 5, true, true)).toBe("5m 15s");
	});

	test("when 5 minutes 15 seconds short version and detailed information is disabled", () => {
		expect(humanReadableTime(63 * 5, true, false)).toBe("5m");
	});
});
