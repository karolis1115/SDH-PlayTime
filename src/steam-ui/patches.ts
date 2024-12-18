import { type RoutePatch, routerHook } from "@decky/api";
import { afterPatch } from "@decky/ui";
import { runInAction } from "mobx";
import type { ReactElement } from "react";
import type { Cache } from "../app/cache";
import type { AppDetails, AppOverview } from "../app/model";
import type { Mountable } from "../app/system";

function routePatch(path: string, patch: RoutePatch): Mountable {
	return {
		mount() {
			routerHook.addPatch(path, patch);
		},
		unMount() {
			routerHook.removePatch(path, patch);
		},
	};
}

export function patchAppPage(timeCache: Cache<Map<string, number>>): Mountable {
	return routePatch(
		"/library/app/:appid",
		(props: { path: string; children: ReactElement }) => {
			afterPatch(props.children.props, "renderFunc", (_, ret1) => {
				const overview: AppOverview = ret1.props.children.props.overview;
				const details: AppDetails = ret1.props.children.props.details;
				const app_id: number = overview.appid;

				// just getting value - it fixes blinking issue
				details.nPlaytimeForever;
				if (overview.app_type === 1073741824) {
					if (details && timeCache.isReady()) {
						runInAction(() => {
							const time = timeCache.get()!.get(app_id.toString()) || 0;
							details.nPlaytimeForever = +(time / 60.0).toFixed(1);
						});
					}
				}

				// just getting value - it fixes blinking issue
				details.nPlaytimeForever;

				return ret1;
			});
			return props;
		},
	);
}
