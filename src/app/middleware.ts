import { diffArray } from "@src/utils/diff";
import logger from "@src/utils/logger";
import { reaction } from "mobx";
import { isNil } from "../utils/isNil";
import type { Clock, EventBus, Mountable } from "./system";

export { SteamEventMiddleware };

class SteamEventMiddleware implements Mountable {
	private clock: Clock;
	private eventBus: EventBus;

	constructor(eventBus: EventBus, clock: Clock) {
		this.eventBus = eventBus;
		this.clock = clock;
	}

	private activeHooks: Array<Unregisterable> = [];

	public mount() {
		for (const app of SteamUIStore.RunningApps) {
			this.eventBus.emit({
				type: "GameWasRunningBefore",
				createdAt: this.clock.getTimeMs(),
				game: {
					id: `${app.appid}`,
					name: app.display_name,
				},
			});
		}

		// hook login state (user login/logout)
		this.activeHooks.push(
			SteamClient.User.RegisterForLoginStateChange(
				(username: string, ...rest) => {
					logger.debug("RegisterForLoginStateChange -> ", username, rest);

					if (username) {
						this.eventBus.emit({
							type: "UserLoggedIn",
							createdAt: this.clock.getTimeMs(),
							username: username,
						});

						return;
					}

					this.eventBus.emit({
						type: "UserLoggedOut",
						createdAt: this.clock.getTimeMs(),
					});
				},
			),
		);

		this.activeHooks.push({
			unregister: reaction(
				() => SteamUIStore.RunningApps,
				(
					currentRunningApps: Array<AppOverview>,
					oldRunnedApps: Array<AppOverview>,
				) => {
					const runnedApps = diffArray(
						currentRunningApps,
						oldRunnedApps,
						"appid",
					);

					const closedApps = diffArray(
						oldRunnedApps,
						currentRunningApps,
						"appid",
					);

					for (const runnedApp of runnedApps) {
						const { appid, display_name } = runnedApp;

						if (isNil(appid) || isNil(display_name)) {
							continue;
						}

						this.eventBus.emit({
							type: "GameStarted",
							createdAt: this.clock.getTimeMs(),
							game: {
								id: `${appid}`,
								name: display_name,
							},
						});
					}

					for (const closedApp of closedApps) {
						const { appid, display_name } = closedApp;

						if (isNil(appid) || isNil(display_name)) {
							continue;
						}

						this.eventBus.emit({
							type: "GameStopped",
							createdAt: this.clock.getTimeMs(),
							game: {
								id: `${appid}`,
								name: display_name,
							},
						});
					}
				},
			),
		});

		this.activeHooks.push(
			SteamClient.System.RegisterForOnSuspendRequest(() => {
				for (const app of SteamUIStore.RunningApps) {
					this.eventBus.emit({
						type: "Suspended",
						createdAt: this.clock.getTimeMs(),
						game: {
							id: `${app.appid}`,
							name: app.display_name,
						},
					});
				}
			}),
		);

		this.activeHooks.push(
			SteamClient.System.RegisterForOnResumeFromSuspend(() => {
				for (const app of SteamUIStore.RunningApps) {
					this.eventBus.emit({
						type: "ResumeFromSuspend",
						createdAt: this.clock.getTimeMs(),
						game: {
							id: `${app.appid}`,
							name: app.display_name,
						},
					});
				}
			}),
		);

		this.activeHooks.push(
			(() => {
				const originalInitiateSleep = SuspendResumeStore.InitiateSleep;
				const instance = this;

				SuspendResumeStore.InitiateSleep = function () {
					for (const app of SteamUIStore.RunningApps) {
						instance.eventBus.emit({
							type: "Suspended",
							createdAt: instance.clock.getTimeMs(),
							game: {
								id: `${app.appid}`,
								name: app.display_name,
							},
						});
					}

					originalInitiateSleep.apply(this);
				};

				return {
					unregister: () => {
						SuspendResumeStore.InitiateSleep = function () {
							originalInitiateSleep.apply(this);
						};
					},
				};
			})(),
		);
	}

	public async unMount() {
		for (const it of this.activeHooks) {
			it.unregister();
		}
	}
}
