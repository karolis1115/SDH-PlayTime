import type { Router as DeckyUiRouter } from "@decky/ui";

declare module "*.svg" {
	const content: string;
	export default content;
}

declare module "*.png" {
	const content: string;
	export default content;
}

declare module "*.jpg" {
	const content: string;
	export default content;
}

declare module "@decky/ui" {
	interface Router extends DeckyUiRouter {
		m_runningAppIDs: Array<string>;
	}
}
