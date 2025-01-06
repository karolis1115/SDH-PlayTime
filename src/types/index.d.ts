type Nullable<T> = T | null | undefined;

interface Unregisterable {
	/**
	 * Unregister the callback.
	 */
	unregister(): void;
}
