import { Field, PanelSection, PanelSectionRow } from "@decky/ui";
import { useLocator } from "@src/locator";
import moment from "moment";
import type { FC } from "react";
import { humanReadableTime } from "../../app/formatters";
import type { DailyStatistics } from "../../app/model";
import { FocusableExt } from "../FocusableExt";

export const AverageAndOverall: FC<{ statistics: DailyStatistics[] }> = (
	props,
) => {
	const { currentSettings: settings } = useLocator();
	const overall = props.statistics
		.map((it) => it.total)
		.reduce((a, c) => a + c, 0);
	const today = moment(new Date()).startOf("day");
	const daysPassed = props.statistics.filter((it) =>
		moment(it.date).startOf("day").isSameOrBefore(today),
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
