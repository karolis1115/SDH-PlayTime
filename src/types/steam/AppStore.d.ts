import type { set as MobXSet } from "mobx";

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
	GetVerticalCapsuleURLForApp: (
		gameOverview: AppOverview,
	) => string | undefined;
	GetPregeneratedVerticalCapsuleForApp: unknown;
	GetCachedVerticalCapsuleURL: unknown;
	GetCustomImageURLs: (appOverview: AppOverview) => Array<string>;
	GetCustomVerticalCapsuleURLs: unknown;
	GetCustomLandcapeImageURLs: unknown;
	GetCustomHeroImageURLs: unknown;
	GetCustomLogoImageURLs: unknown;
	GetStorePageURLForApp: unknown;
	m_mapApps: {
		// set: (appId: number, appOverview: AppOverview) => void;
		set: typeof MobXSet;
		// NOTE(ynhhoJ): Custom added type
		originalSet: Nullable<typeof MobXSet>;
	};
}
