import { PanelSection } from "@decky/ui";
import { Button } from "@src/steam/enums/Button";
import { registerForInputEvent } from "@src/steam/registerForInputEvent";
import { useEffect, useState } from "react";
import { formatWeekInterval } from "../app/formatters";
import {
	type DailyStatistics,
	convertDailyStatisticsToGameWithTime,
} from "../app/model";
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
	const { reports, currentSettings: settings } = useLocator();
	const [lastChangedPageTimeStamp, setLastChangedPageTimeStamp] =
		useState<number>(0);
	const [isLoading, setLoading] = useState<boolean>(false);
	const [currentPage, setCurrentPage] = useState<Paginated<DailyStatistics>>(
		empty(),
	);

	useEffect(() => {
		setLoading(true);

		reports.weeklyStatistics().then((it) => {
			setCurrentPage(it);
			setLoading(false);
		});
	}, []);

	useEffect(() => {
		if (slim) {
			return;
		}

		const { unregister } = registerForInputEvent((buttons) => {
			if (buttons.length !== 1) {
				return;
			}

			if (new Date().getTime() - lastChangedPageTimeStamp <= 500) {
				return;
			}

			if (buttons.includes(Button.L2) && currentPage.hasPrev()) {
				setLastChangedPageTimeStamp(new Date().getTime());

				onPrevWeek();
			}

			if (buttons.includes(Button.R2) && currentPage.hasNext()) {
				setLastChangedPageTimeStamp(new Date().getTime());

				onNextWeek();
			}
		});

		return () => {
			unregister();
		};
	}, [
		currentPage.current().interval.start.getTime(),
		currentPage.current().interval.end.getTime(),
	]);

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
						<PanelSection title="By game">
							<GamesTimeBarView
								data={convertDailyStatisticsToGameWithTime(data)}
							/>

							{settings.gameChartStyle === ChartStyle.PIE_AND_BARS && (
								<PieView statistics={data} />
							)}
						</PanelSection>
					)}
				</div>
			)}
		</div>
	);
};
