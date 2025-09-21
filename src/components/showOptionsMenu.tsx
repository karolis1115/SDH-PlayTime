import { toaster } from "@decky/api";
import { Menu, MenuGroup, MenuItem, showContextMenu } from "@decky/ui";
import { Backend } from "@src/app/backend";
import { addGameChecksumById } from "@src/app/games";
import { $toggleUpdateInListeningComponents } from "@src/stores/ui";
import { isNil } from "@src/utils/isNil";
import { useEffect, useState } from "react";

type ShowGameOptionsContextMenuProperties = {
	gameName: string;
	gameId: string;
	hasChecksumEnabled: boolean;
};

async function linkToAnotherGameWithChecksum(
	childGameId: string,
	parentGameId: string,
) {
	await Backend.linkGameToGameWithChecksum(childGameId, parentGameId).then(
		() => {
			$toggleUpdateInListeningComponents.set(
				!$toggleUpdateInListeningComponents.get(),
			);
		},
	);
}

function showLinkToAnotherGameWithChecksumContextMenu(
	gameId: string,
	gameName: string,
	hasChecksum: boolean = false,
	gamesWithChecksums: Array<FileChecksum>,
) {
	if (hasChecksum) {
		toaster.toast({
			title: "PlayTime",
			body: "Can not link checksum for a game which already has checksum",
		});

		return;
	}

	const gamesWhichChecksums = [];

	for (const gameWithChecksum of gamesWithChecksums) {
		gamesWhichChecksums.push({
			id: gameWithChecksum.game.id,
			name: gameWithChecksum.game.name,
		});
	}

	showContextMenu(
		<Menu label={`${gameName} (ID: ${gameId})`}>
			{gamesWhichChecksums.map((item) => {
				if (gameId === item.id) {
					return undefined;
				}

				return (
					<MenuItem
						key={item.id}
						onClick={() => linkToAnotherGameWithChecksum(gameId, item.id)}
					>
						{item.name} (ID: {gameId})
					</MenuItem>
				);
			})}
		</Menu>,
	);
}

function ChecksumOptionsMenu({
	gameName,
	gameId,
	hasChecksumEnabled,
}: ShowGameOptionsContextMenuProperties) {
	const [isLoading, setIsLoading] = useState(true);
	const [gamesWithChecksums, setGamesWithChekcums] = useState<
		Array<FileChecksum>
	>([]);
	const [currentGameChecksum, setCurrentGameChecksum] =
		useState<Nullable<FileChecksum>>(undefined);

	useEffect(() => {
		if (!hasChecksumEnabled) {
			return;
		}

		Backend.getGamesChecksum().then((response) => {
			const gameIdWithChecksum = response.find(
				(item) => item?.game.id === gameId,
			);

			if (!isNil(gameIdWithChecksum)) {
				setCurrentGameChecksum(gameIdWithChecksum);
			}

			setGamesWithChekcums(response);
			setIsLoading(false);
		});
	}, []);

	if (!hasChecksumEnabled) {
		return undefined;
	}

	// NOTE(ynhhoJ): Only non-steam games have 10 number length of `ID`
	if (gameId.length < 10) {
		return undefined;
	}

	if (isLoading) {
		return <MenuItem disabled>Loading...</MenuItem>;
	}

	const hasChecksum = !isNil(currentGameChecksum);

	return (
		<MenuGroup label="Checksum">
			<MenuItem
				onClick={() =>
					showLinkToAnotherGameWithChecksumContextMenu(
						gameId,
						gameName,
						hasChecksum,
						gamesWithChecksums,
					)
				}
				disabled={hasChecksum}
			>
				Link to another game with checksum
			</MenuItem>

			<MenuItem
				onClick={() => addGameChecksumById(gameId)}
				disabled={hasChecksum}
			>
				Add game checksum to DB
			</MenuItem>

			<MenuItem
				tone="destructive"
				disabled={!hasChecksum}
				onClick={() => {
					if (
						isNil(currentGameChecksum) ||
						isNil(currentGameChecksum?.checksum)
					) {
						return;
					}

					Backend.removeGameChecksum(
						gameId,
						currentGameChecksum?.checksum,
					).then(() => {
						$toggleUpdateInListeningComponents.set(
							!$toggleUpdateInListeningComponents.get(),
						);
					});
				}}
			>
				Remove game checksum
			</MenuItem>
		</MenuGroup>
	);
}

export function showGameOptionsContextMenu({
	gameName,
	gameId,
	hasChecksumEnabled,
}: ShowGameOptionsContextMenuProperties) {
	return () => {
		showContextMenu(
			<Menu label={`${gameName} (ID: ${gameId})`}>
				<ChecksumOptionsMenu
					hasChecksumEnabled={hasChecksumEnabled}
					gameId={gameId}
					gameName={gameName}
				/>
				<MenuItem disabled>Soon..</MenuItem>
			</Menu>,
		);
	};
}
