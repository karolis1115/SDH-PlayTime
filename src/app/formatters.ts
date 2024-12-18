import type { Interval } from "./reports";

export {
	humanReadableTime,
	toIsoDateOnly,
	formatMonthInterval,
	formatWeekInterval,
};

function humanReadableTime(seconds: number, short = true): string {
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);

	const plurals = (value: number, nonPlural: string) => {
		if (value == 1) {
			return nonPlural;
		} else return nonPlural + "s";
	};

	let result = "";
	if (short) {
		if (hours > 0) {
			result += `${hours}h `;
		}
		result += `${minutes % 60}m`;
		return result;
	} else {
		if (hours > 0) {
			result += `${hours} ${plurals(hours, "hour")} `;
		}
		result += `${minutes % 60} ${plurals(minutes % 60, "minute")}`;
	}
	return result;
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
