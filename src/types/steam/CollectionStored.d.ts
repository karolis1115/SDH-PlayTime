interface CollectionStore {
	userCollections: SteamCollection[];
	GetUserCollectionsByName: (name: string) => SteamCollection[];
	allAppsCollection: SteamCollection;
	deckDesktopApps: SteamCollection;
}
