import logger from "@src/utils/logger";
import { atom } from "nanostores";

export const gameChecksums = {
	dataBase: new Map<string, GameDictionary>(),
	nonSteam: new Map<string, LocalNonSteamGame>(),
};

export type LoadingStateValue = "empty" | "loading" | "loaded";

export const $gameCheksumsLoadingState = atom<LoadingStateValue>("empty");
export const unbindListener = $gameCheksumsLoadingState.subscribe(
	(value, oldValue) => {
		logger.debug(
			`$gameCheksumsLoadingState value changed from ${oldValue} to ${value}`,
		);

		if (value !== "empty") {
			return;
		}

		gameChecksums.dataBase.clear();
		gameChecksums.nonSteam.clear();
	},
);
