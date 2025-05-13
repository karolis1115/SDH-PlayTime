import { Menu, MenuItem, showContextMenu } from "@decky/ui";

type ShowGameOptionsContextMenuProperties = {
	gameName: string;
	gameId: string;
};

export function showGameOptionsContextMenu({
	gameName,
	gameId,
}: ShowGameOptionsContextMenuProperties) {
	return () => {
		showContextMenu(
			<Menu label={`${gameName} (ID: ${gameId})`}>
				<MenuItem disabled>TODO</MenuItem>
			</Menu>,
		);
	};
}
