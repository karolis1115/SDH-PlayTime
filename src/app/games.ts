import getAppDetails from "@src/steam/utils/getAppDetails";
import getPathToGameFileByLaunchCommand from "@src/steam/utils/getPathToGameFileByLaunchCommand";
import { isNil } from "@src/utils/isNil";
import { Backend } from "./backend";

export function getAllNonSteamAppIds() {
	return Array.from(collectionStore.deckDesktopApps.apps.keys());
}

export const nonSteamGamesChecksum = new Map<string, GameDictionary>();

export async function getCurrentNonSteamGamesChecksum() {
	const allNonSteamAppIds = getAllNonSteamAppIds();

	for (const applicationId of allNonSteamAppIds) {
		getAppDetails(applicationId).then((appDetails) => {
			if (!appDetails) {
				return;
			}

			const launchCommand = `${appDetails.strShortcutExe} ${appDetails.strShortcutLaunchOptions}`;
			const pathToGame = getPathToGameFileByLaunchCommand(launchCommand);

			if (!pathToGame) {
				return;
			}

			console.time(appDetails.strDisplayName);

			Backend.getFileSHA256(pathToGame).then((fileSHA256) => {
				const { strDisplayName } = appDetails;
				console.timeEnd(strDisplayName);

				if (isNil(fileSHA256)) {
					nonSteamGamesChecksum.set(`${applicationId}`, {
						id: `${applicationId}`,
						name: strDisplayName,
						sha256: undefined,
					});

					return;
				}

				nonSteamGamesChecksum.set(`${applicationId}`, {
					id: `${applicationId}`,
					name: strDisplayName,
					sha256: fileSHA256,
				});
			});
		});
	}
}
