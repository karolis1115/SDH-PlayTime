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
