// NOTE(ynhhoJ): https://github.com/FrogTheFrog/moondeck/blob/main/src/lib/appoverviewpatcher.ts#L122
export function getMobxAdministrationSymbol(
	objectWithMobx: object,
): Nullable<symbol> {
	for (const symbol of Object.getOwnPropertySymbols(objectWithMobx)) {
		if (!symbol.description?.includes("mobx administration")) {
			continue;
		}

		return symbol;
	}

	return undefined;
}
