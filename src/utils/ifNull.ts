export function ifNull<T>(value: T | undefined, defaultValue: T): T {
	if (value === undefined) {
		return defaultValue;
	}

	return value;
}
