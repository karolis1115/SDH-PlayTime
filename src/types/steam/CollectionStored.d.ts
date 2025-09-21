interface CollectionStore {
	userCollections: SteamCollection[];
	GetUserCollectionsByName: (name: string) => SteamCollection[];
	allAppsCollection: SteamCollection;
	/**
	 * NOTE(ynhhoJ): `null` on desktop mode
	 */
	deckDesktopApps?: SteamCollection;
}
