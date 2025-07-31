import { empty, type Paginated } from "@src/app/reports";
import logger from "@src/utils/logger";
import { atom } from "nanostores";

export const $toggleUpdateInListeningComponents = atom<boolean>(false);
export const $lastOpenedPage = atom<ReportPage>("all-time");
export const $lastMonthlyStatisticsPage = atom<Paginated<DayStatistics>>(
	empty(),
);
export const $lastWeeklyStatisticsPage = atom<Paginated<DayStatistics>>(
	empty(),
);

export const unbindLastOpenedPageListener = $lastOpenedPage.subscribe(
	(value, oldValue) => {
		logger.debug(
			`$gameCheksumsLoadingState value changed from ${oldValue} to ${value}`,
		);

		if (value !== "by-month") {
			$lastMonthlyStatisticsPage.set(empty());
			logger.debug("reset monthly page");
		}

		if (value !== "by-week") {
			$lastWeeklyStatisticsPage.set(empty());
			logger.debug("reset weekly page");
		}
	},
);
