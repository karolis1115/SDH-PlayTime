import { toaster } from "@decky/api";
import {
	ButtonItem,
	Menu,
	MenuItem,
	ModalRoot,
	showContextMenu,
	showModal,
} from "@decky/ui";
import { useStore } from "@nanostores/react";
import { Backend } from "@src/app/backend";
import { initializeGameDetectionByChecksum } from "@src/app/games";
import { FocusableExt } from "@src/components/FocusableExt";
import { $gameCheksumsLoadingState, gameChecksums } from "@src/stores/games";
import { TableCSS } from "@src/styles";
import { isNil } from "@src/utils/isNil";
import logger from "@src/utils/logger";
import { useEffect, useState } from "react";

function verifyIfHasChecksumSaved(
	fileChecksum: Nullable<string>,
	dbChecksum: Nullable<Array<string>>,
) {
	if (isNil(fileChecksum) || isNil(dbChecksum)) {
		return false;
	}

	return dbChecksum.includes(fileChecksum);
}

const showGameInformation = (
	game: LocalNonSteamGame,
	hasChecksum: boolean,
	hasChecksumSaved: boolean,
) => {
	showModal(
		<ModalRoot>
			<h2>{game.name}</h2>

			<details>
				<summary>Raw information</summary>
				<pre
					style={{
						whiteSpace: "pre-wrap",
						wordWrap: "break-word",
						fontSize: "13px",
					}}
				>
					{JSON.stringify(game, null, 2)}
				</pre>
				{hasChecksum} | {hasChecksumSaved}
			</details>
		</ModalRoot>,
		window,
	);
};

function showChecksumContextMenu(
	gameInformation: LocalNonSteamGame,
	hasChecksum: boolean,
	hasChecksumSaved: boolean,
) {
	// TODO: Implement detection by ID

	showContextMenu(
		<Menu label="Actions">
			<MenuItem
				onSelected={() => {
					console.log(11, gameInformation);

					if (isNil(gameInformation.checksum)) {
						toaster.toast({
							title: "PlayTime",
							body: "Checksum is undefined",
						});

						return;
					}

					Backend.addGameChecksum(
						gameInformation.id,
						gameInformation.checksum,
						"SHA256",
						// NOTE(ynhhoJ): 16 MB
						16 * 1024 * 1024,
					).then(async () => {
						// $gameCheksumsLoadingState.set("loading");
						toaster.toast({
							title: "PlayTime",
							body: `Saved checksum for ${gameInformation.name}`,
						});

						await initializeGameDetectionByChecksum();
					});
				}}
				disabled={hasChecksum && hasChecksumSaved}
			>
				Save checksum in DataBase
			</MenuItem>

			<MenuItem
				onSelected={() => {
					console.log(22, gameInformation);

					if (isNil(gameInformation.checksum)) {
						toaster.toast({
							title: "PlayTime",
							body: "Checksum is undefined",
						});

						return;
					}

					Backend.removeGameChecksum(
						gameInformation.id,
						gameInformation.checksum,
					).then(async () => {
						toaster.toast({
							title: "PlayTime",
							body: `Rmoved "${gameInformation.name}" checksum`,
						});

						await initializeGameDetectionByChecksum();
					});
				}}
				disabled={hasChecksum && !hasChecksumSaved}
				tone="destructive"
			>
				Remove checksum
			</MenuItem>
		</Menu>,
	);
}

async function saveAllChecksums(tableRows: Array<LocalNonSteamGame>) {
	const savedChecksumsForGames: Array<string> = [];

	for (const game of tableRows) {
		const { checksum } = game;
		const hasChecksum = !isNil(checksum);

		if (!hasChecksum) {
			continue;
		}

		const hasChecksumSaved = verifyIfHasChecksumSaved(
			game?.checksum,
			gameChecksums.dataBase
				.get(game.id)
				?.filesChecksum.map((item) => item.checksum),
		);

		if (hasChecksumSaved) {
			continue;
		}

		const hasDuplicate = [...gameChecksums.dataBase]
			.map((item) => item[1])
			.find((item) =>
				item.filesChecksum.find(
					(checksum) =>
						checksum.checksum === game?.checksum && item.game.id !== game?.id,
				),
			);

		if (hasDuplicate) {
			return;
		}

		await Backend.addGameChecksum(
			game.id,
			checksum,
			"checksum",
			16 * 1024 * 1024,
		)
			.then(() => {
				savedChecksumsForGames.push(game.name);
			})
			.catch((_error) => {});
	}

	toaster.toast({
		title: "PlayTime",
		body: `Saved checksum for ${savedChecksumsForGames.length} games`,
	});

	logger.debug(
		`Saved checksum for ${savedChecksumsForGames.length} games`,
		savedChecksumsForGames,
	);

	await initializeGameDetectionByChecksum();
}

function FileChecksumStatus({
	hasChecksumSaved,
	game,
}: {
	game: LocalNonSteamGame;
	hasChecksumSaved: boolean;
}) {
	if (isNil(game?.pathToGame)) {
		return (
			<span className="inline-flex justify-center items-center rounded-md bg-red-400/10 px-2 py-1 text-xs font-medium text-red-400 ring-1 ring-red-400/20 ring-inset">
				File not found or unsupported path
			</span>
		);
	}

	if (isNil(game?.checksum)) {
		return (
			<span className="inline-flex justify-center items-center rounded-md bg-red-400/10 px-2 py-1 text-xs font-medium text-red-400 ring-1 ring-red-400/20 ring-inset">
				Unknown checksum
			</span>
		);
	}

	if (!hasChecksumSaved) {
		return (
			<span className="inline-flex justify-center items-center rounded-md bg-yellow-400/10 px-2 py-1 text-xs font-medium text-yellow-400 ring-1 ring-yellow-400/20 ring-inset">
				Not saved
			</span>
		);
	}

	return (
		<span className="inline-flex justify-center items-center rounded-md bg-green-400/10 px-2 py-1 text-xs font-medium text-green-400 ring-1 ring-green-400/20 ring-inset">
			Saved
		</span>
	);
}

export function FileChecksum() {
	const [tableRows, setTableRows] = useState<Array<LocalNonSteamGame>>([]);
	const gameCheksumsLoadingStateStore = useStore($gameCheksumsLoadingState);

	logger.debug(
		"gameCheksumsLoadingStateStore -> ",
		gameCheksumsLoadingStateStore,
		gameChecksums,
	);

	useEffect(() => {
		if (gameCheksumsLoadingStateStore === "loaded") {
			setTableRows(
				Array.from(gameChecksums.nonSteam).map(([_name, value]) => value),
			);

			return;
		}

		initializeGameDetectionByChecksum().then(() => {
			setTableRows(
				Array.from(gameChecksums.nonSteam).map(([_name, value]) => value),
			);
		});
	}, [gameCheksumsLoadingStateStore]);

	if (gameCheksumsLoadingStateStore === "loading") {
		return <span>Loading...</span>;
	}

	return (
		<>
			<ButtonItem onClick={async () => await saveAllChecksums(tableRows)}>
				Save all checksums in DataBase
			</ButtonItem>

			<div style={TableCSS.table__container}>
				<div
					className="header-row"
					style={{
						gridTemplateColumns: "70% 30%",
						...TableCSS.header__row,
					}}
				>
					<div style={TableCSS.header__col}>Name</div>
					<div style={TableCSS.header__col}>Status</div>
				</div>
			</div>

			{tableRows.map((row) => {
				const hasChecksum = !isNil(row?.checksum);
				const hasChecksumSaved = verifyIfHasChecksumSaved(
					row?.checksum,
					gameChecksums.dataBase
						.get(row.id)
						?.filesChecksum.map((item) => item.checksum),
				);

				return (
					<FocusableExt
						key={row.id}
						flow-children="horizontal"
						style={{
							gridTemplateColumns: "75% 25%",
							...TableCSS.table__row,
							textAlign: "left",
						}}
						onMenuActionDescription="Options"
						onMenuButton={() =>
							showChecksumContextMenu(row, hasChecksum, hasChecksumSaved)
						}
						onOKActionDescription="Details"
						onOKButton={() =>
							showGameInformation(row, hasChecksum, hasChecksumSaved)
						}
					>
						<div
							style={{
								padding: "0 0.5rem",
								display: "flex",
								alignItems: "center",
							}}
						>
							{row.name}
						</div>

						<FileChecksumStatus
							hasChecksumSaved={hasChecksumSaved}
							game={row}
						/>
					</FocusableExt>
				);
			})}
		</>
	);
}
