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
