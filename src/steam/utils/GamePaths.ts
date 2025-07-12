import { isNil } from "@src/utils/isNil";
import getAppDetails from "./getAppDetails";
import logger from "@src/utils/logger";

// NOTE(ynhhoJ): https://github.com/0u73r-h34v3n/chrono-deck/blob/master/src/utils/steam/getPathToGameFileByLaunchCommand.ts
export default function getEmudeckPathToGame(launchCommand: string) {
	const regex = /(["'])([^"']*\/Emulation\/roms\/[^"']+\.[a-z0-9]+)\1/gi;

	const match = launchCommand.match(regex);

	return match ? match[0].replace(/['"]/g, "") : undefined;
}

export async function getPathToGame(applicationId: number) {
	return getAppDetails(applicationId).then((appDetails) => {
		if (!appDetails) {
			return;
		}

		let pathToGame: Nullable<string>;
		const { strShortcutExe, strShortcutLaunchOptions } = appDetails;

		if (strShortcutExe.includes("Emulation")) {
			pathToGame = getEmudeckPathToGame(
				`${appDetails.strShortcutExe} ${strShortcutLaunchOptions}`,
			);
		}

		if (strShortcutExe.includes(".exe")) {
			pathToGame = strShortcutExe;
		}

		if (isNil(pathToGame)) {
			logger.debug(`Unsupported pathToGame:`, {
				strShortcutExe,
				strShortcutLaunchOptions,
			});
		}

		console.log(
			"getPathToGame -> ",
			appDetails,
			strShortcutExe,
			appDetails.strShortcutExe,
			appDetails.strShortcutLaunchOptions,
		);

		return pathToGame;
	});
}
