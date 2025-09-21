interface OverviewChange {
	appid: () => number;
}

interface AppInfoStore {
	OnAppOverviewChange: (apps: Array<OverviewChange>) => void;
	// NOTE(ynhhoJ): Custom added type
	OriginalOnAppOverviewChange: Nullable<(apps: Array<OverviewChange>) => void>;
}
