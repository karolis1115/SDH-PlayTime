export function map<T, U>(
	data: T | undefined,
	mapFunc: (data: T) => U,
): U | undefined {
	if (data === undefined) {
		return undefined;
	}

	return mapFunc(data);
}
