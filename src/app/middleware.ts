import { Router, sleep } from "@decky/ui";
import { isNil } from "../utils/isNil";
import type { Game } from "./model";
import type { Clock, EventBus, Mountable } from "./system";

export { SteamEventMiddleware, type SteamHook };

class SteamEventMiddleware implements Mountable {
	private clock: Clock;
	private eventBus: EventBus;

	constructor(eventBus: EventBus, clock: Clock) {
		this.eventBus = eventBus;
		this.clock = clock;
	}

	private activeHooks: Array<SteamHook> = [];

	public mount() {
		const gameInfo = this.fetchGameInfo();

		if (!isNil(gameInfo)) {
			this.eventBus.emit({
				type: "GameWasRunningBefore",
				createdAt: this.clock.getTimeMs(),
				game: gameInfo,
			});
		}

		// hook login state (user login/logout)
		this.activeHooks.push(
			SteamClient.User.RegisterForLoginStateChange((username: string) => {
				if (username) {
					this.eventBus.emit({
						type: "UserLoggedIn",
						createdAt: this.clock.getTimeMs(),
						username: username,
					});
				} else {
					this.eventBus.emit({
						type: "UserLoggedOut",
						createdAt: this.clock.getTimeMs(),
					});
				}
			}),
		);

		this.activeHooks.push(
			SteamClient.GameSessions.RegisterForAppLifetimeNotifications(
				async (data: LifetimeNotification) => {
					let game = await this.awaitGameInfo();

					if (isNil(game)) {
						game = {
							id: data.unAppID.toString(),
							name: "",
						};
					}

					if (data.bRunning) {
						this.eventBus.emit({
							type: "GameStarted",
							createdAt: this.clock.getTimeMs(),
							game: game,
						});

						return;
					}

					if (
						Router.m_runningAppIDs.includes(game?.id) &&
						appStore.GetAppOverviewByGameID(game?.id).app_type !== 1073741824
					) {
						return;
					}

					this.eventBus.emit({
						type: "GameStopped",
						createdAt: this.clock.getTimeMs(),
						game: game,
					});
				},
			),
		);

		this.activeHooks.push(
			SteamClient.System.RegisterForOnSuspendRequest(async () => {
				this.eventBus.emit({
					type: "Suspended",
					createdAt: this.clock.getTimeMs(),
					game: this.fetchGameInfo(),
				});
			}),
		);

		this.activeHooks.push(
			SteamClient.System.RegisterForOnResumeFromSuspend(async () => {
				this.eventBus.emit({
					type: "ResumeFromSuspend",
					createdAt: this.clock.getTimeMs(),
					game: this.fetchGameInfo(),
				});
			}),
		);
	}

	private async awaitGameInfo(): Promise<Game> {
		await waitForPredicate(4, 200, async () => {
			return !isNil(this.fetchGameInfo());
		});

		return this.fetchGameInfo() as Game;
	}

	private fetchGameInfo(): Game | null {
		if (Router.MainRunningApp != null) {
			return {
				id: Router.MainRunningApp.appid,
				name: Router.MainRunningApp.display_name,
			} as Game;
		}

		return null;
	}

	public async unMount() {
		for (const it of this.activeHooks) {
			it.unregister();
		}
	}
}

async function waitForPredicate(
	retries: number,
	delay: number,
	predicate: () => boolean | Promise<boolean>,
): Promise<boolean> {
	const waitImpl = async (): Promise<boolean> => {
		try {
			let tries = retries + 1;
			while (tries-- !== 0) {
				if (await predicate()) {
					return true;
				}
				if (tries > 0) {
					await sleep(delay);
				}
			}
		} catch (error) {
			console.error(error);
		}

		return false;
	};

	return await waitImpl();
}

interface LifetimeNotification {
	unAppID: number;
	nInstanceID: string;
	bRunning: boolean;
}

interface SteamHook {
	unregister: () => void;
}
