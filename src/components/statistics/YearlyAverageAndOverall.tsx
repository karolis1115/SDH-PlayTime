import { Field, PanelSection, PanelSectionRow } from "@decky/ui";
import { useLocator } from "@src/locator";
import { isNil } from "@src/utils/isNil";
import { type FC, useMemo } from "react";
import { humanReadableTime } from "../../app/formatters";
import { FocusableExt } from "../FocusableExt";

function calculateAverages(yearlyStats: Array<YearlyStatistics>): {
	averagePlaytime: number;
	averagePerMonth: number;
	averagePerDay: number;
} {
	const totalMonths = yearlyStats.filter(
		(month) => month.sessions.length !== 0,
	).length;

	let totalPlaytime = 0;
	let totalSessions = 0;
	let totalDays = 0;

	for (const monthStats of yearlyStats) {
		// Add total playtime for the month
		totalPlaytime += monthStats.total;

		// Add the number of sessions for this month
		totalSessions += monthStats.sessions_count;

		// Count the number of days (using sessions to avoid duplicates)
		totalDays += monthStats.sessions.reduce(
			(accumulator, session) => {
				const date = new Date(session.date).getDate();

				if (isNil(accumulator.dates[date])) {
					accumulator.dates[date] = 1;
					accumulator.days += 1;

					return accumulator;
				}

				return accumulator;
			},
			{ days: 0, dates: {} },
		).days;
	}

	// Calculate averages
	const averagePlaytime = totalPlaytime / totalSessions;
	const averagePerMonth = totalPlaytime / totalMonths;
	const averagePerDay = totalPlaytime / totalDays;

	return {
		averagePlaytime,
		averagePerMonth,
		averagePerDay,
	};
}

export const YearlyAverageAndOverall: FC<{
	statistics: Array<YearlyStatistics>;
}> = ({ statistics }) => {
	const { currentSettings: settings } = useLocator();

	const averages = useMemo(() => calculateAverages(statistics), []);

	return (
		<FocusableExt style={{ marginTop: "16px" }}>
			<PanelSection title="Average and overall">
				<PanelSectionRow>
					<Field label="Playtime average" bottomSeparator="none">
						{humanReadableTime(
							settings.displayTime.showTimeInHours,
							averages.averagePlaytime,
							true,
							settings.displayTime.showSeconds,
						)}
					</Field>
				</PanelSectionRow>

				<PanelSectionRow>
					<Field label="Per month average" bottomSeparator="none">
						{humanReadableTime(
							settings.displayTime.showTimeInHours,
							averages.averagePerMonth,
							true,
							settings.displayTime.showSeconds,
						)}
					</Field>
				</PanelSectionRow>

				<PanelSectionRow>
					<Field label="Per day average" bottomSeparator="none">
						{humanReadableTime(
							settings.displayTime.showTimeInHours,
							averages.averagePerDay,
							true,
							settings.displayTime.showSeconds,
						)}
					</Field>
				</PanelSectionRow>
			</PanelSection>
		</FocusableExt>
	);
};
