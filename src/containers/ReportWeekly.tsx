import { PanelSection } from "@decky/ui";
import { sortPlayedTime } from "@src/app/sortPlayTime";
import { SortBy, getSelectedSortOptionByKey } from "@src/app/sortPlayTime";
import { showGameOptionsContextMenu } from "@src/components/showOptionsMenu";
import { showSortTitlesContextMenu } from "@src/components/showSortTitlesContextMenu";
import { formatWeekInterval } from "@utils/formatters";
import { useEffect, useMemo, useState } from "react";
import { convertDailyStatisticsToGameWithTime } from "../app/model";
import { type Paginated, empty } from "../app/reports";
import { ChartStyle } from "../app/settings";
import { Pager } from "../components/Pager";
import { AverageAndOverall } from "../components/statistics/AverageAndOverall";
import { GamesTimeBarView } from "../components/statistics/GamesTimeBarView";
import { PieView } from "../components/statistics/PieView";
import { WeekView } from "../components/statistics/WeekView";
import { useLocator } from "../locator";

interface ReportWeeklyProperties {
	slim?: boolean;
}

export const ReportWeekly = ({ slim = false }: ReportWeeklyProperties) => {
	const { reports, currentSettings, settings, setCurrentSettings } =
		useLocator();
	const [isLoading, setLoading] = useState<boolean>(false);
	const [currentPage, setCurrentPage] = useState<Paginated<DailyStatistics>>(
		empty(),
	);
	const sortType = currentSettings.selectedSortByOption || "mostPlayed";

	const selectedSortOptionByKey =
		getSelectedSortOptionByKey(currentSettings.selectedSortByOption) ||
		"MOST_PLAYED";
	const sortOptionName = SortBy[selectedSortOptionByKey].name;
	const sectionTitle = slim ? "By Game" : `Sort ${sortOptionName}`;

	const { interval } = currentPage.current();
	const { start, end } = interval;

	const sortedData = useMemo(
		() =>
			sortPlayedTime(
				convertDailyStatisticsToGameWithTime(currentPage.current().data),
				currentSettings.selectedSortByOption,
			),
		[sortType, `${start} - ${end}`],
	);

	useEffect(() => {
		setLoading(true);

		reports.weeklyStatistics().then((it) => {
			setCurrentPage(it);
			setLoading(false);
		});
	}, []);

	const onNextWeek = () => {
		setLoading(true);

		currentPage?.next().then((it) => {
			setCurrentPage(it);
			setLoading(false);
		});
	};

	const onPrevWeek = () => {
		setLoading(true);

		currentPage?.prev().then((it) => {
			setCurrentPage(it);
			setLoading(false);
		});
	};

	const data = currentPage.current().data;
	const isAnyGames =
		data
			.map((it) => {
				return it.games.length;
			})
			.reduce((a, b) => a + b, 0) > 0;

	const onOptionsPress = () => {
		showSortTitlesContextMenu({
			currentSettings,
			settings,
			setCurrentSettings,
		})();
	};

	const onMenuPress = (gameName: string, gameId: string) => {
		showGameOptionsContextMenu({ gameName, gameId })();
	};

	return (
		<div>
			<Pager
				onNext={onNextWeek}
				onPrev={onPrevWeek}
				currentText={formatWeekInterval(currentPage.current().interval)}
				hasNext={currentPage.hasNext()}
				hasPrev={currentPage.hasPrev()}
				prevKey={slim ? undefined : "l2"}
				nextKey={slim ? undefined : "r2"}
				isEnabledChangePagesWithTriggers={!slim}
			/>

			{isLoading && <div>Loading...</div>}

			{!isLoading && !currentPage && <div>Error while loading data</div>}

			{!isLoading && currentPage && (
				<div>
					<AverageAndOverall statistics={data} />

					<PanelSection title="By day">
						<WeekView statistics={data} />
					</PanelSection>

					{isAnyGames && (
						<PanelSection title={sectionTitle}>
							<GamesTimeBarView
								data={sortedData}
								showCovers={!slim}
								onOptionsPress={onOptionsPress}
								onMenuPress={onMenuPress}
							/>

							{currentSettings.gameChartStyle === ChartStyle.PIE_AND_BARS && (
								<PieView statistics={data} />
							)}
						</PanelSection>
					)}
				</div>
			)}
		</div>
	);
};
