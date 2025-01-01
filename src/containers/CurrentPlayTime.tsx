import { Field, PanelSection, PanelSectionRow } from "@decky/ui";
import type { PlayTime } from "@src/app/SessionPlayTime";
import { humanReadableTime } from "../app/formatters";
import { useLocator } from "../locator";

function PlaySessionsInformation({
	currentPlayTime,
}: { currentPlayTime: Array<PlayTime> }) {
	if (currentPlayTime.length === 1) {
		const currentSessionTimeAsText = humanReadableTime(
			currentPlayTime[0].playTime,
			true,
			true,
		);

		return <span>{currentSessionTimeAsText}</span>;
	}

	return (
		<div style={{ display: "flex", flexDirection: "column" }}>
			{currentPlayTime.map((game) => (
				<span key={game.gameName}>
					{game.gameName} - {humanReadableTime(game.playTime, true, true)}
				</span>
			))}
		</div>
	);
}

export const CurrentPlayTime = () => {
	const { sessionPlayTime } = useLocator();

	const currentPlayTime = sessionPlayTime.getPlayTime(Date.now());

	return (
		<div>
			{currentPlayTime.length !== 0 && (
				<PanelSection>
					<PanelSectionRow>
						<Field label="Current play session">
							<PlaySessionsInformation currentPlayTime={currentPlayTime} />
						</Field>
					</PanelSectionRow>
				</PanelSection>
			)}
		</div>
	);
};
