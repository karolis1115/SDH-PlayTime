import { Field, PanelSection, PanelSectionRow } from "@decky/ui";
import type { VFC } from "react";
import { humanReadableTime } from "../app/formatters";
import { useLocator } from "../locator";

export const CurrentPlayTime: VFC = () => {
	const { sessionPlayTime } = useLocator();

	const currentPlayTime = sessionPlayTime.getPlayTime(Date.now());
	const currentSessionTimeAsText = humanReadableTime(currentPlayTime);
	return (
		<div>
			{currentPlayTime !== 0 && (
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
