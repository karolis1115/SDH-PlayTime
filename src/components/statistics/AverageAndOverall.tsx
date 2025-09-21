import { Field, PanelSection, PanelSectionRow } from "@decky/ui";
import { useLocator } from "@src/locator";
import { humanReadableTime } from "@utils/formatters";
import { isBefore, isSameDay, startOfDay } from "date-fns";
import type { FC } from "react";
import { FocusableExt } from "../FocusableExt";

export const AverageAndOverall: FC<{ statistics: DailyStatistics[] }> = (
	props,
) => {
	const { currentSettings: settings } = useLocator();
	const overall = props.statistics
		.map((it) => it.total)
		.reduce((a, c) => a + c, 0);
	const today = startOfDay(new Date());
	const daysPassed = props.statistics.filter(
		(it) =>
			isSameDay(it.date, startOfDay(today)) ||
			isBefore(it.date, startOfDay(today)),
	).length;
	const average = overall / daysPassed;

	return (
		<FocusableExt style={{ marginTop: "16px" }}>
			<PanelSection title="Average and overall">
				<PanelSectionRow>
					<Field label="Daily average" bottomSeparator="none">
						{humanReadableTime(
							settings.displayTime.showTimeInHours,
							average,
							true,
							settings.displayTime.showSeconds,
						)}
					</Field>
				</PanelSectionRow>

				<PanelSectionRow>
					<Field label="Overall" bottomSeparator="none">
						{humanReadableTime(
							settings.displayTime.showTimeInHours,
							overall,
							true,
							settings.displayTime.showSeconds,
						)}
					</Field>
				</PanelSectionRow>
			</PanelSection>
		</FocusableExt>
	);
};
