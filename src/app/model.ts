export {
	type Game,
	type GameWithTime,
	type DailyStatistics,
	type AppOverview,
	type AppDetails,
	type AppAchievements,
	type AppAchievement,
	type AppLanguages,
	type AppStore,
	convertDailyStatisticsToGameWithTime,
	type AppInfoStore,
};

interface Game {
	id: string;
	name: string;
}

interface GameWithTime {
	game: Game;
	time: number;
}

interface DailyStatistics {
	date: string;
	games: GameWithTime[];
	total: number;
}

function convertDailyStatisticsToGameWithTime(
	data: DailyStatistics[],
): GameWithTime[] {
	const result: GameWithTime[] = [];

	for (const day of data) {
		for (const game of day.games) {
			const found = result.find((g) => g.game.id === game.game.id);
			if (found) {
				found.time += game.time;
			} else {
				result.push(game);
			}
		}
	}
	return result;
}

interface AppOverview {
	__proto__: unknown;
	appid: number;
	InitFromProto: unknown;
	OriginalInitFromProto: unknown;
	display_name: string;
	app_type: number;
	mru_index: number;
	rt_recent_activity_time: number;
	minutes_playtime_forever: string;
	minutes_playtime_last_two_weeks: number;
	rt_last_time_played_or_installed: number;
	rt_last_time_played: number;
	rt_last_time_locally_played: number;
	rt_original_release_date: number;
	rt_steam_release_date: number;
	size_on_disk: string;
	m_gameid: string;
	visible_in_game_list: boolean;
	m_ulGameId: {
		low: number;
		high: number;
		unsigned: boolean;
	};
	library_capsule_filename: string;
	most_available_clientid: string;
	selected_clientid: string;
	rt_custom_image_mtime: number;
	sort_as: string;
	association: {
		name: string;
		type: number;
	}[];
	m_setStoreCategories: Set<number>;
	m_setStoreTags: Set<number>;
	per_client_data: [
		{
			clientid: string;
			client_name: string;
			display_status: number;
			status_percentage: number;
			installed: boolean;
			bytes_downloaded: string;
			bytes_total: string;
			is_available_on_current_platform: boolean;
			cloud_status: number;
		},
	];
	canonicalAppType: number;
	local_per_client_data: {
		clientid: string;
		client_name: string;
		display_status: number;
		status_percentage: number;
		installed: boolean;
		bytes_downloaded: string;
		bytes_total: string;
		is_available_on_current_platform: boolean;
		cloud_status: number;
	};
	most_available_per_client_data: {
		clientid: string;
		client_name: string;
		display_status: number;
		status_percentage: number;
		installed: boolean;
		bytes_downloaded: string;
		bytes_total: string;
		is_available_on_current_platform: boolean;
		cloud_status: number;
	};
	selected_per_client_data: {
		clientid: string;
		client_name: string;
		display_status: number;
		status_percentage: number;
		installed: boolean;
		bytes_downloaded: string;
		bytes_total: string;
		is_available_on_current_platform: boolean;
		cloud_status: number;
	};
	review_score_with_bombs: number;
	review_percentage_with_bombs: number;
	review_score_without_bombs: number;
	review_percentage_without_bombs: number;
	steam_deck_compat_category: number;
}

interface AppAchievement {
	strID: string;
	strName: string;
	strDescription: string;
	bAchieved: boolean;
	rtUnlocked: number;
	strImage: string;
	bHidden: boolean;
	flMinProgress: number;
	flCurrentProgress: number;
	flMaxProgress: number;
	flAchieved: number;
}

interface AppAchievements {
	nAchieved: number;
	nTotal: number;
	vecAchievedHidden: AppAchievement[];
	vecHighlight: AppAchievement[];
	vecUnachieved: AppAchievement[];
}

interface AppLanguages {
	strDisplayName: string;
	strShortName: string;
}

interface AppDetails {
	achievements: AppAchievements;
	bCanMoveInstallFolder: boolean;
	bCloudAvailable: boolean;
	bCloudEnabledForAccount: boolean;
	bCloudEnabledForApp: boolean;
	bCloudSyncOnSuspendAvailable: boolean;
	bCloudSyncOnSuspendEnabled: boolean;
	bCommunityMarketPresence: boolean;
	bEnableAllowDesktopConfiguration: boolean;
	bFreeRemovableLicense: boolean;
	bHasAllLegacyCDKeys: boolean;
	bHasunknownLocalContent: boolean;
	bHasLockedPrivateBetas: boolean;
	bIsExcludedFromSharing: boolean;
	bIsSubscribedTo: boolean;
	bOverlayEnabled: boolean;
	bOverrideInternalResolution: boolean;
	bRequiresLegacyCDKey: boolean;
	bShortcutIsVR: boolean;
	bShowCDKeyInMenus: boolean;
	bShowControllerConfig: boolean;
	bSupportsCDKeyCopyToClipboard: boolean;
	bVRGameTheatreEnabled: boolean;
	bWorkshopVisible: boolean;
	eAppOwnershipFlags: number;
	eAutoUpdateValue: number;
	eBackgroundDownloads: number;
	eCloudSync: number;
	eControllerRumblePreference: number;
	eDisplayStatus: number;
	eEnableThirdPartyControllerConfiguration: number;
	eSteamInputControllerMask: number;
	iInstallFolder: number;
	lDiskUsageBytes: number;
	lDlcUsageBytes: number;
	nBuildID: number;
	nCompatToolPriority: number;
	nPlaytimeForever: number;
	nScreenshots: number;
	rtLastTimePlayed: number;
	rtLastUpdated: number;
	rtPurchased: number;
	selectedLanguage: {
		strDisplayName: string;
		strShortName: string;
	};
	strCloudBytesAvailable: string;
	strCloudBytesUsed: string;
	strCompatToolDisplayName: string;
	strCompatToolName: string;
	strDeveloperName: string;
	strDeveloperURL: string;
	strDisplayName: string;
	strExternalSubscriptionURL: string;
	strFlatpakAppID: string;
	strHomepageURL: string;
	strLaunchOptions: string;
	strManualURL: string;
	strOwnerSteamID: string;
	strResolutionOverride: string;
	strSelectedBeta: string;
	strShortcutExe: string;
	strShortcutLaunchOptions: string;
	strShortcutStartDir: string;
	strSteamDeckBlogURL: string;
	unAppID: number;
	vecBetas: unknown[];
	vecDLC: unknown[];
	vecDeckCompatTestResults: unknown[];
	vecLanguages: AppLanguages[];
	vecLegacyCDKeys: unknown[];
	vecMusicAlbums: unknown[];
	vecPlatforms: string[];
	vecScreenShots: unknown[];
}

interface AppStore {
	UpdateAppOverview: unknown;
	GetAppOverviewByAppID: (id: number) => AppOverview;
	GetAppOverviewByGameID: (id: string) => AppOverview;
	CompareSortAs: unknown;
	allApps: AppOverview[];
	storeTagCounts: unknown;
	GetTopStoreTags: unknown;
	OnLocalizationChanged: unknown;
	GetStoreTagLocalization: unknown;
	GetLocalizationForStoreTag: unknown;
	AsyncGetLocalizationForStoreTag: unknown;
	sharedLibraryAccountIds: unknown;
	siteLicenseApps: unknown;
	GetIconURLForApp: unknown;
	GetLandscapeImageURLForApp: unknown;
	GetCachedLandscapeImageURLForApp: unknown;
	GetVerticalCapsuleURLForApp: unknown;
	GetPregeneratedVerticalCapsuleForApp: unknown;
	GetCachedVerticalCapsuleURL: unknown;
	GetCustomImageURLs: unknown;
	GetCustomVerticalCapsuleURLs: unknown;
	GetCustomLandcapeImageURLs: unknown;
	GetCustomHeroImageURLs: unknown;
	GetCustomLogoImageURLs: unknown;
	GetStorePageURLForApp: unknown;
	m_mapApps: unknown;
}

interface AppInfoStore {
	OnAppOverviewChange: unknown;
	OriginalOnAppOverviewChange: unknown;
}
