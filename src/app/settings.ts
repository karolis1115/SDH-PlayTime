import { isNil } from "@src/utils/isNil";
import logger from "../utils";

declare global {
	// @ts-ignore
	let SteamClient: SteamClient;
}

export interface PlayTimeSettings {
	gameChartStyle: ChartStyle;
	reminderToTakeBreaksInterval: number;
}

export enum ChartStyle {
	PIE_AND_BARS = 0,
	BAR = 1,
}

const PLAY_TIME_SETTINGS_KEY = "decky-loader-SDH-Playtime";
export const DEFAULTS: PlayTimeSettings = {
	gameChartStyle: ChartStyle.BAR,
	reminderToTakeBreaksInterval: -1,
};

export class Settings {
	constructor() {
		SteamClient.Storage.GetJSON(PLAY_TIME_SETTINGS_KEY).catch((e: Error) => {
			if (e.message === "Not found") {
				logger.error("Unable to get settings, saving defaults", e);
				SteamClient.Storage.SetObject(PLAY_TIME_SETTINGS_KEY, DEFAULTS);
			} else {
				logger.error("Unable to get settings", e);
			}
		});
	}

	async get(): Promise<PlayTimeSettings> {
		const settings = await SteamClient.Storage.GetJSON(PLAY_TIME_SETTINGS_KEY);

		if (isNil(settings)) {
			return DEFAULTS;
		}

		return JSON.parse(settings) as PlayTimeSettings;
	}

	async save(data: PlayTimeSettings) {
		await SteamClient.Storage.SetObject(PLAY_TIME_SETTINGS_KEY, data);
	}
}
