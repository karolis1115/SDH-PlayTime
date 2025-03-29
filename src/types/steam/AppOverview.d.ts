interface SteamAppOverview {
	BIsModOrShortcut: () => boolean;
	BIsShortcut: () => boolean;
	InitFromProto: (proto: unknown) => void;
	app_type: number;
	appid: number;
	display_name: string;
	gameid: string;
	icon_hash: string;
	minutes_playtime_forever: string;
	minutes_playtime_last_two_weeks: number;
	selected_clientid?: string;
	third_party_mod?: boolean;
}

interface AppOverview extends SteamAppOverview {
	// NOTE(ynhhoJ): Custom added type
	OriginalInitFromProto: (proto: unknown) => void;
}
