import logger from "../utils";

import type { Game } from "./model";
import type { EventBus } from "./system";

export { SessionPlayTime };

interface ActiveInterval {
	startedAt: number;
	game: Game;
}

class SessionPlayTime {
	private activeInterval: ActiveInterval | null = null;
	private eventBus: EventBus;

	constructor(eventBus: EventBus) {
		this.eventBus = eventBus;
		eventBus.addSubscriber((event) => {
			switch (event.type) {
				case "GameWasRunningBefore":
					this.startInterval(event.createdAt, event.game);
					break;

				case "GameStarted":
					this.startInterval(event.createdAt, event.game!);
					break;

				case "GameStopped":
					this.commitInterval(event.createdAt, event.game!);
					break;

				case "Suspended":
					if (this.activeInterval != null) {
						this.commitInterval(event.createdAt, this.activeInterval.game);
					}
					break;

				case "ResumeFromSuspend":
					if (event.game != null) {
						this.startInterval(event.createdAt, event.game);
					}
					break;

				case "Unmount":
					if (this.activeInterval != null) {
						this.commitInterval(event.createdAt, this.activeInterval.game);
					}
					break;
			}
		});
	}

	public getPlayTime(requestedAt: number): number {
		if (this.activeInterval != null) {
			return (requestedAt - this.activeInterval.startedAt) / 1000;
		}
		return 0;
	}

	public isActiveInterval() {
		return this.activeInterval != null;
	}

	private startInterval(startedAt: number, game: Game) {
		if (this.activeInterval != null && this.activeInterval.game.id == game.id) {
			logger.error(`Getting same game start interval, ignoring it`);
			return;
		}
		if (this.activeInterval != null && this.activeInterval.game.id != game.id) {
			logger.error(
				`Interval already started but for the different game ` +
					`['${this.activeInterval.game.id}', '${this.activeInterval.game.name}'] -> [['${game.id}', '${game.name}']];`,
			);
			this.activeInterval = null;
		}

		this.activeInterval = {
			startedAt: startedAt,
			game: game,
		} as ActiveInterval;
	}

	private commitInterval(endedAt: number, game: Game) {
		if (this.activeInterval == null) {
			logger.error("There is no active interval, ignoring commit");
			return;
		}
		if (this.activeInterval.game.id != game.id) {
			logger.error(
				`Could not commit interval with different games:` +
					` ['${this.activeInterval.game.id}', '${this.activeInterval.game.name}'] -> [['${game.id}', '${game.name}']] `,
			);
			return;
		}

		this.eventBus.emit({
			type: "CommitInterval",
			startedAt: this.activeInterval.startedAt,
			endedAt: endedAt,
			game: this.activeInterval.game,
		});
		this.activeInterval = null;
	}
}
