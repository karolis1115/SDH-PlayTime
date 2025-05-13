declare module "*.css";

type Nullable<T> = T | null | undefined;

interface Unregisterable {
	/**
	 * Unregister the callback.
	 */
	unregister(): void;
}

interface Session {
	date: string;
	duration: number;
	migrated?: string;
}

interface GameInformation {
	id: string;
	name: string;
	time: number;
}

interface Game {
	id: string;
	name: string;
}

interface SessionInformation {
	date: string;
	duration: number;
}

interface GameWithTime {
	game: Game;
	time: number;
	sessions: Array<SessionInformation>;
	last_session: SessionInformation;
}

interface DailyStatistics {
	date: string;
	games: GameWithTime[];
	total: number;
}

interface GameDictionary {
	id: string;
	name: string;
	sha256: Nullable<string>;
}
