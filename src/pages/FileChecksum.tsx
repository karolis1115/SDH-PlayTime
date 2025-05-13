import { ButtonItem, Focusable, PanelSection } from "@decky/ui";
import { Backend } from "@src/app/backend";
import { nonSteamGamesChecksum } from "@src/app/games";
import { FocusableExt } from "@src/components/FocusableExt";
import { PageWrapper } from "@src/components/PageWrapper";
import { TableCSS } from "@src/styles";
import { isNil } from "@src/utils/isNil";
import { useEffect, useState } from "react";

function hasIdenticalChecksum(
	fileChecksum: Nullable<string>,
	dbChecksum: Nullable<string>,
) {
	if (isNil(fileChecksum) || isNil(dbChecksum)) {
		return false;
	}

	return true;
}

export function FileChecksum() {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [tableRows, setTableRows] = useState<Array<GameDictionary>>([]);

	useEffect(() => {
		Backend.getGamesDictionary().then((response) => {
			if (isNil(response)) {
				setIsLoading(false);

				// const nonSteamKeys = [...nonSteamGamesChecksum.keys()];
				// const onlyNonSteamGames = nonSteamKeys.sort((a, b) =>
				// 	a.name.localeCompare(b.name),
				// );
				//
				// setTableRows(onlyNonSteamGames);
				// setIsLoading(false);

				return;
			}

			const nonSteamKeys = [...nonSteamGamesChecksum.keys()];
			const onlyNonSteamGames = response
				.filter((game) => nonSteamKeys.includes(game.id))
				.sort((a, b) => a.name.localeCompare(b.name));

			setTableRows(onlyNonSteamGames);
			setIsLoading(false);
		});
	}, []);

	if (isLoading) {
		return (
			<PageWrapper>
				<span>Loading...</span>
			</PageWrapper>
		);
	}

	function saveFilesChecksum() {
		console.log("saveFilesChecksum");
	}

	return (
		<PageWrapper>
			<Focusable style={{ height: "calc(100% - 45px)", overflow: "scroll" }}>
				<PanelSection>
					<ButtonItem layout="below" onClick={() => saveFilesChecksum()}>
						Synchronize All Files SHA256 with DataBase
					</ButtonItem>

					<div style={TableCSS.table__container}>
						<div
							className="header-row"
							style={{
								gridTemplateColumns: "75% 25%",
								...TableCSS.header__row,
							}}
						>
							<div style={TableCSS.header__col}>Name</div>
							<div style={TableCSS.header__col}>Identical SHA256</div>
						</div>

						{tableRows.map((row) => {
							const currentFileChecksum = nonSteamGamesChecksum.get(row.id);
							const identicalChecksum = hasIdenticalChecksum(
								currentFileChecksum?.sha256,
								row?.sha256,
							);

							return (
								<FocusableExt
									key={row.id}
									flow-children="horizontal"
									style={{
										gridTemplateColumns: "75% 25%",
										...TableCSS.table__row,
										...(identicalChecksum
											? TableCSS.table__row_correct
											: TableCSS.table__row_not_correct),
										textAlign: "left",
									}}
									onMenuActionDescription={<span>Options</span>}
								>
									<div style={{ paddingLeft: "0.5rem" }}>{row.name}</div>

									<div style={{ textAlign: "center" }}>
										{identicalChecksum ? "Yes" : "No"}
									</div>
								</FocusableExt>
							);
						})}
					</div>
				</PanelSection>
			</Focusable>
		</PageWrapper>
	);
}
