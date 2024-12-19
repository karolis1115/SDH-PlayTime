import { PanelSection, PanelSectionRow } from "@decky/ui";
import { type VFC, useEffect, useState } from "react";
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

export const ReportMonthly: VFC = () => {
	const { reports, currentSettings: settings } = useLocator();
	const [isLoading, setLoading] = useState<boolean>(false);
	const [currentPage, setCurrentPage] = useState<Paginated<DailyStatistics>>(
		empty(),
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
					/>
				</PanelSectionRow>
			</PanelSection>

			{isLoading && <div>Loading...</div>}

			{!isLoading && !currentPage && <div>Error while loading data</div>}

			{!isLoading && currentPage && (
				<div>
					<AverageAndOverall statistics={currentPage.current().data} />
					<MonthView statistics={currentPage.current().data} />
					<GamesTimeBarView
						data={convertDailyStatisticsToGameWithTime(
							currentPage.current().data,
						)}
					/>

					{settings.gameChartStyle === ChartStyle.PIE_AND_BARS && (
						<PieView statistics={currentPage.current().data} />
					)}
				</div>
			)}
		</div>
	);
};
