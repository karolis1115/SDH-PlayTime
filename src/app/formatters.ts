import { isNil } from "@src/utils/isNil";
import { type Duration, intervalToDuration } from "date-fns";
import type { Interval } from "./reports";

export {
	humanReadableTime,
	toIsoDateOnly,
	formatMonthInterval,
	formatWeekInterval,
};

function humanReadableTime(
	seconds: number,
	short = true,
	withSeconds = false,
): string {
	let duration: Duration = {};

	if (seconds === 0) {
		duration = {
			seconds: 0,
		};
	} else {
		duration = intervalToDuration({
			start: new Date(),
			end: new Date().getTime() + seconds * 1000,
		});
	}

	return Object.keys(duration)
		.reduce<Array<string>>((accumulator, key) => {
			if (
				key === "seconds" &&
				!withSeconds &&
				// NOTE(ynhhoJ): If `seconds` key is only one in object then we should display it
				Object.keys(duration).length !== 1
			) {
				return accumulator;
			}

			const durationValue = duration[key as keyof Duration];

			if (isNil(durationValue)) {
				return accumulator;
			}

			if (short) {
				accumulator.push(`${durationValue}${key[0]}`);

				return accumulator;
			}

			const durationTime =
				durationValue === 1 ? key.slice(0, key.length - 1) : key;

			accumulator.push(`${durationValue} ${durationTime}`);

			return accumulator;
		}, [])
		.join(" ");
}

function toIsoDateOnly(date: Date) {
	return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function formatMonthInterval(interval: Interval) {
	return interval.start.toLocaleDateString("en-us", {
		month: "long",
		year: "numeric",
	});
}

function formatWeekInterval(interval: Interval) {
	return `${interval.start.toLocaleDateString("en-us", {
		day: "2-digit",
		month: "long",
	})} - ${interval.end.toLocaleDateString("en-us", {
		day: "2-digit",
		month: "long",
	})}`;
}
