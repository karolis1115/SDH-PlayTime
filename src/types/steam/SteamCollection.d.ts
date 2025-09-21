interface SteamCollection {
	__proto__: SteamCollection;
	AsDeletableCollection: () => null;
	AsDragDropCollection: () => null;
	AsEditableCollection: () => null;
	GetAppCountWithToolsFilter: (t: unknown) => unknown;
	allApps: SteamAppOverview[];
	apps: Map<number, SteamAppOverview>;
	bAllowsDragAndDrop: boolean;
	bIsDeletable: boolean;
	bIsDynamic: boolean;
	bIsEditable: boolean;
	displayName: string;
	id: string;
	visibleApps: SteamAppOverview[];
}
