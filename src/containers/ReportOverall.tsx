import { Menu, MenuItem, showContextMenu } from "@decky/ui";
import {
	SortBy,
	type SortByKeys,
	type SortByObjectKeys,
	sortPlayedTime,
} from "@src/app/sortPlayTime";
import { useEffect, useMemo, useState } from "react";
import type { GameWithTime } from "../app/model";
import { GamesTimeBarView } from "../components/statistics/GamesTimeBarView";
import { useLocator } from "../locator";

export const ReportOverall = () => {
	const { reports, currentSettings, settings } = useLocator();
	const [data, setData] = useState<GameWithTime[]>([]);
	const [isLoading, setLoading] = useState<boolean>(false);
	const [sortType, setSortType] = useState<SortByKeys>(
		currentSettings.selectedSortByOption || "mostPlayed",
	);

	useEffect(() => {
		setLoading(true);

		reports.overallStatistics().then((it) => {
			setData(it);
			setLoading(false);
		});
	}, []);

	useEffect(() => {
		settings
			.save({
				...currentSettings,
				selectedSortByOption: sortType,
			})
			.then(() => {
				currentSettings.selectedSortByOption = sortType;
			});
	}, [sortType]);

	const sortedData = useMemo(
		() => sortPlayedTime(data, sortType),
		[sortType, data],
	);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!data) {
		return <div>Error while loading data</div>;
	}

	const onOptionsPress = () => {
		const objectKeys = Object.keys(
			SortBy,
		) as unknown as Array<SortByObjectKeys>;
		const selectedOption = objectKeys.find(
			(item) => SortBy[item].key === currentSettings.selectedSortByOption,
		);

		showContextMenu(
			<Menu label="Sort titles">
				{objectKeys.map((key) => {
					return (
						<MenuItem
							key={SortBy[key].key}
							onSelected={() => {
								setSortType(() => SortBy[key].key);
							}}
							disabled={key === selectedOption}
						>
							{SortBy[key].name}
						</MenuItem>
					);
				})}
			</Menu>,
		);
	};

	return (
		<div>
			<GamesTimeBarView
				data={sortedData}
				showCovers={true}
				onOptionsPress={onOptionsPress}
			/>
		</div>
	);
};
