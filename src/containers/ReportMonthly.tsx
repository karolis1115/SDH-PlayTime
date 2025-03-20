import { PanelSection, PanelSectionRow } from "@decky/ui";
import { sortPlayedTime } from "@src/app/sortPlayTime";
import { SortBy, getSelectedSortOptionByKey } from "@src/app/sortPlayTime";
import { showSortTitlesContextMenu } from "@src/components/showSortTitlesContextMenu";
import { useEffect, useMemo, useState } from "react";
import { formatMonthInterval } from "../app/formatters";
import {
	type DailyStatistics,
	convertDailyStatisticsToGameWithTime,
} from "../app/model";
import { type Paginated, empty } from "../app/reports";
import { ChartStyle } from "../app/settings";
import { Pager } from "../components/Pager";
import { AverageAndOverall } from "../components/statistics/AverageAndOverall";
import { GamesTimeBarView } from "../components/statistics/GamesTimeBarView";
import { MonthView } from "../components/statistics/MonthView";
import { PieView } from "../components/statistics/PieView";
import { useLocator } from "../locator";

export const ReportMonthly = () => {
	const { reports, currentSettings, settings, setCurrentSettings } =
		useLocator();
	const [isLoading, setLoading] = useState<boolean>(false);
	const [currentPage, setCurrentPage] = useState<Paginated<DailyStatistics>>(
		empty(),
	);
	const sortType = currentSettings.selectedSortByOption || "mostPlayed";
	const { interval } = currentPage.current();
	const { start, end } = interval;

	const selectedSortOptionByKey =
		getSelectedSortOptionByKey(currentSettings.selectedSortByOption) ||
		"MOST_PLAYED";
	const sortOptionName = SortBy[selectedSortOptionByKey].name;

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

		reports.monthlyStatistics().then((it) => {
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

	const onOptionsPress = () => {
		showSortTitlesContextMenu({
			currentSettings,
			settings,
			setCurrentSettings,
		})();
	};

	return (
		<div>
			<PanelSection>
				<PanelSectionRow>
					<Pager
						onNext={onNextWeek}
						onPrev={onPrevWeek}
						currentText={formatMonthInterval(currentPage.current().interval)}
						hasNext={currentPage.hasNext()}
						hasPrev={currentPage.hasPrev()}
						isEnabledChangePagesWithTriggers={true}
					/>
				</PanelSectionRow>
			</PanelSection>

			{isLoading && <div>Loading...</div>}

			{!isLoading && !currentPage && <div>Error while loading data</div>}

			{!isLoading && currentPage && (
				<div>
					<AverageAndOverall statistics={currentPage.current().data} />

					<MonthView statistics={currentPage.current().data} />

					<PanelSection title={`Sort ${sortOptionName}`}>
						<GamesTimeBarView
							data={sortedData}
							showCovers={true}
							onOptionsPress={onOptionsPress}
						/>

						{currentSettings.gameChartStyle === ChartStyle.PIE_AND_BARS && (
							<PieView statistics={currentPage.current().data} />
						)}
					</PanelSection>
				</div>
			)}
		</div>
	);
};
