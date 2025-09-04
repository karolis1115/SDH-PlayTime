const mobxAdministrationSymbol = Symbol("mobx administration");
const mobxStoredAnnotationsSymbol = Symbol("mobx-stored-annotations");

interface SteamUIStore {
	RunningApps: Array<AppOverview>;
	[mobxAdministrationSymbol]: unknown;
	[mobxStoredAnnotationsSymbol]: unknown;
}
