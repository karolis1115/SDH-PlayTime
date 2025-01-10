import type { AppInfoStore, AppStore } from "@src/app/model";

declare global {
	// @ts-ignore
	let appStore: AppStore;
	let appInfoStore: AppInfoStore;
	let SteamUIStore: SteamUIStore;
	let SteamClient: SteamClient;
	let SuspendResumeStore: SuspendResumeStore;
}
