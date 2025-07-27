import { toaster } from "@decky/api";
import { getPathToGame } from "@src/steam/utils/GamePaths";
import { $gameCheksumsLoadingState, gameChecksums } from "@src/stores/games";
import { isNil } from "@src/utils/isNil";
import logger from "@src/utils/logger";
import { Backend } from "./backend";
import { APP_TYPE } from "@src/constants";

export function getAllNonSteamAppIds() {
	if (isNil(collectionStore.deckDesktopApps)) {
		return appStore.allApps
			.filter((item) => item.app_type === APP_TYPE.THIRD_PARTY)
			.map((item) => Number.parseInt(item.gameid));
	}

	return Array.from(collectionStore.deckDesktopApps.apps.keys());
}

export async function getFileSHA256(applicationId: number) {
	try {
		const pathToGame = await getPathToGame(applicationId);
		const { display_name: displayName } =
			appStore.GetAppOverviewByAppID(applicationId);

		if (isNil(pathToGame)) {
			logger.debug(
				"[getFileSHA256] null or empty path to game. App ID: ",
				applicationId,
			);

			return {
				id: `${applicationId}`,
				name: displayName,
			};
		}

		const fileSHA256 = await Backend.getFileSHA256(pathToGame);

		if (isNil(fileSHA256)) {
			return {
				id: `${applicationId}`,
				name: displayName,
				pathToGame: pathToGame,
			};
		}

		return {
			id: `${applicationId}`,
			name: displayName,
			checksum: fileSHA256,
			pathToGame,
		};
	} catch (error) {
		logger.error(error);

		return undefined;
	}
}

export async function getNonSteamGamesChecksumFromDataBase() {
	return await Backend.getGamesDictionary().then((response) => {
		if (isNil(response)) {
			return;
		}

		const nonSteamKeys = getAllNonSteamAppIds();
		const onlyNonSteamGames = response
			.filter((game) =>
				nonSteamKeys.includes(Number.parseInt(game.game.id, 10)),
			)
			.sort((a, b) => a.game.name.localeCompare(b.game.name))
			.map((item) => ({
				...item,
				...gameChecksums.nonSteam.get(item.game.id),
			}));

		console.log("onlyNonSteamGames -> ", onlyNonSteamGames);

		for (const nonSteamGame of onlyNonSteamGames) {
			gameChecksums.dataBase.set(nonSteamGame.game.id, nonSteamGame);
		}

		console.log(
			"getNonSteamGamesChecksumFromDataBase -> end",
			gameChecksums.dataBase,
		);
	});
}

export async function getCurrentNonSteamGamesChecksum() {
	if (gameChecksums.nonSteam.size !== 0) {
		gameChecksums.nonSteam.clear();
	}

	const allNonSteamAppIds = getAllNonSteamAppIds();

	for (const applicationId of allNonSteamAppIds) {
		await getFileSHA256(applicationId).then((response) => {
			if (isNil(response)) {
				return;
			}

			console.log(
				"nonSteamGamesChecksum -> set -> ",
				applicationId,
				response,
				gameChecksums.nonSteam,
			);
			gameChecksums.nonSteam.set(`${applicationId}`, response);
		});
	}
}

export async function findGameWithSameChecksum(appId: number) {
	const fileSHA256 = await getFileSHA256(appId);

	const array = [...gameChecksums.dataBase].map((item) => item[1]);

	const gameWithSameSHA256 = array.find((item) =>
		item.files.find((checksum) => checksum.checksum === fileSHA256?.checksum),
	);

	return gameWithSameSHA256;
}

export async function initializeGameDetectionByChecksum() {
	if ($gameCheksumsLoadingState.get() === "loading") {
		return;
	}

	$gameCheksumsLoadingState.set("loading");

	const allNonSteamAppIdsLength = getAllNonSteamAppIds().length;

	toaster.toast({
		title: "PlayTime",
		body: `Generating SHA256 for ${allNonSteamAppIdsLength} non-steam games.`,
	});

	await getNonSteamGamesChecksumFromDataBase();
	console.log("go to getCurrentNonSteamGamesChecksum");
	await getCurrentNonSteamGamesChecksum();

	console.log("nonSteamGamesChecksum -> 111 -> ", gameChecksums.nonSteam);

	$gameCheksumsLoadingState.set("loaded");

	toaster.toast({
		title: "PlayTime",
		body: `Generated SHA256 for ${gameChecksums.nonSteam.size}/${allNonSteamAppIdsLength} non-steam games.`,
	});
}
