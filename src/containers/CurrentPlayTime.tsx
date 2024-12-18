import { Field, PanelSection, PanelSectionRow } from "@decky/ui";
import { humanReadableTime } from "../app/formatters";
import { useLocator } from "../locator";
import type { VFC } from "react";

export const CurrentPlayTime: VFC<{}> = () => {
	const { sessionPlayTime } = useLocator();

	const currentPlayTime = sessionPlayTime.getPlayTime(Date.now());
	const currentSessionTimeAsText = humanReadableTime(currentPlayTime);
	return (
		<div>
			{currentPlayTime != 0 && (
				<PanelSection>
					<PanelSectionRow>
						<Field label="Current play session">
							{currentSessionTimeAsText}
						</Field>
					</PanelSectionRow>
				</PanelSection>
			)}
		</div>
	);
};
