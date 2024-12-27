export function diffArray<T>(
	firstArray: Array<T>,
	secondArray: Array<T>,
	key: keyof T,
): T[] {
	return firstArray.filter((firstArrayObject) => {
		return !secondArray.find((secondArrayObject) => {
			return firstArrayObject[key] === secondArrayObject[key];
		});
	});
}
