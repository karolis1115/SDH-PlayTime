import { isNil } from "es-toolkit";
import { Clock, EventBus } from "../system";
import { MobxComputedValue, MobxObservableValue } from "@src/utils/mobx";

export function hasLegacySuspendEvents() {
	if (
		!isNil(SteamClient?.System?.RegisterForOnSuspendRequest) ||
		!isNil(SteamClient?.System?.RegisterForOnResumeFromSuspend)
	) {
		return true;
	}

	return false;
}

export function initializeSuspendRequestLegacyEvents(
	activeHooks: Array<Unregisterable>,
	eventBus: EventBus,
	clock: Clock,
) {
	activeHooks.push(
		SteamClient.System.RegisterForOnSuspendRequest(() => {
			for (const app of SteamUIStore.RunningApps) {
				eventBus.emit({
					type: "Suspended",
					createdAt: clock.getTimeMs(),
					game: {
						id: `${app.appid}`,
						name: app.display_name,
					},
				});
			}
		}),
	);

	activeHooks.push(
		SteamClient.System.RegisterForOnResumeFromSuspend(() => {
			for (const app of SteamUIStore.RunningApps) {
				eventBus.emit({
					type: "ResumeFromSuspend",
					createdAt: clock.getTimeMs(),
					game: {
						id: `${app.appid}`,
						name: app.display_name,
					},
				});
			}
		}),
	);
}

export function runSuspendResumeStoreObservable(
	suspendingResumeProgressObservableValue:
		| MobxComputedValue<SuspendResumeStore["m_bSuspending"]>
		| MobxObservableValue<SuspendResumeStore["m_bSuspending"]>,
	resumingResumeProgressObservableValue:
		| MobxComputedValue<SuspendResumeStore["m_bResuming"]>
		| MobxObservableValue<SuspendResumeStore["m_bResuming"]>,
	activeHooks: Array<Unregisterable>,
	eventBus: EventBus,
	clock: Clock,
) {
	const unregisterAppsObservable =
		suspendingResumeProgressObservableValue.observe_((change) => {
			const { newValue } = change;

			if (!newValue) {
				return;
			}

			for (const app of SteamUIStore.RunningApps) {
				eventBus.emit({
					type: "Suspended",
					createdAt: clock.getTimeMs(),
					game: {
						id: `${app.appid}`,
						name: app.display_name,
					},
				});
			}
		});

	activeHooks.push({
		unregister: () => {
			if (isNil(unregisterAppsObservable)) {
				return;
			}

			return unregisterAppsObservable();
		},
	});

	const unregisterResumeAppsObservable =
		resumingResumeProgressObservableValue.observe_((change) => {
			const { newValue } = change;

			if (!newValue) {
				return;
			}

			for (const app of SteamUIStore.RunningApps) {
				eventBus.emit({
					type: "ResumeFromSuspend",
					createdAt: clock.getTimeMs(),
					game: {
						id: `${app.appid}`,
						name: app.display_name,
					},
				});
			}
		});

	activeHooks.push({
		unregister: () => {
			if (isNil(unregisterResumeAppsObservable)) {
				return;
			}

			return unregisterResumeAppsObservable();
		},
	});
}
