import type { AppStore } from "./steam/AppStore";
import type { SuspendResumeStore as SuspendResumeStoreTypes } from "./steam/SuspendResumeStore";

declare global {
	let appStore: AppStore;
	let appInfoStore: AppInfoStore;
	let SteamUIStore: SteamUIStore;
	let SteamClient: SteamClient;
	let SuspendResumeStore: SuspendResumeStoreTypes;
	let collectionStore: CollectionStore;
}
