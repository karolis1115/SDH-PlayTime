import type {
	ComputedValue,
	ObservableObjectAdministration,
	ObservableValue,
} from "mobx/dist/internal";
import { isNil } from "./isNil";

// NOTE(ynhhoJ): https://github.com/FrogTheFrog/moondeck/blob/main/src/lib/appoverviewpatcher.ts#L122
export function getMobxAdministrationSymbol(
	objectWithMobx: object,
): Nullable<symbol> {
	for (const symbol of Object.getOwnPropertySymbols(objectWithMobx)) {
		if (!symbol.description?.includes("mobx administration")) {
			continue;
		}

		return symbol;
	}

	return undefined;
}

type MobxComputedValue<T> = ComputedValue<T>;
type MobxObservableValue<T> = ObservableValue<T>;

export function getRunningAppsObservableValue<T>():
	| MobxComputedValue<T>
	| MobxObservableValue<T>
	| undefined {
	const mobxSymbol = getMobxAdministrationSymbol(SteamUIStore);

	if (isNil(mobxSymbol)) {
		return;
	}

	const steamUiStoreObservable = SteamUIStore[
		mobxSymbol as keyof SteamUIStore
	] as unknown as ObservableObjectAdministration;

	if (isNil(steamUiStoreObservable)) {
		return;
	}

	return steamUiStoreObservable.values_.get("RunningApps");
}
