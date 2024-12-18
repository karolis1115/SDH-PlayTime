import { Navigation } from "@decky/ui";

export const SETTINGS_ROUTE = "/playtime/settings";
export const DETAILED_REPORT_ROUTE = "/playtime/detailed-report";
export const MANUALLY_ADJUST_TIME = "/playtime/manually-adjust-time";

export function navigateToPage(url: string) {
	Navigation.CloseSideMenus();
	Navigation.Navigate(url);
}

export function navigateBack() {
	Navigation.CloseSideMenus();
	Navigation.NavigateBack();
}
