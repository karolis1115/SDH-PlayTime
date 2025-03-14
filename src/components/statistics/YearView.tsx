import { humanReadableTime } from "@src/app/formatters";
import type { DailyStatistics } from "@src/app/model";
import { useLocator } from "@src/locator";
import { format } from "date-fns";
import { useMemo } from "react";
import {
	Bar,
	CartesianGrid,
	ComposedChart,
	LabelList,
	Legend,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";
import { FocusableExt } from "../FocusableExt";

interface YearViewProperties {
	statistics: Array<DailyStatistics>;
}

type ChartsStatistics = {
	monthName: string;
	total: number;
	migrated: number;
};

export function YearView({ statistics: yearStatistics }: YearViewProperties) {
	const { currentSettings: settings } = useLocator();

	const statistics = useMemo(() => {
		return yearStatistics.reduce<Array<ChartsStatistics>>(
			(accumulator, currentValue) => {
				const { date, total } = currentValue;

				const monthName = format(date, "MMM");
				const index = accumulator.findIndex(
					(item) => item.monthName === monthName,
				);

				if (index === -1) {
					accumulator.push({
						monthName,
						total,
						migrated: 0,
					});

					return accumulator;
				}

				accumulator[index] = {
					...accumulator[index],
					total: accumulator[index].total + total,
				};

				return accumulator;
			},
			[],
		);
	}, [yearStatistics]);

	return (
		<FocusableExt>
			<div className="playtime-chart">
				<div className="bar-by-month" style={{ width: "100%", height: 300 }}>
					<ResponsiveContainer>
						<ComposedChart
							data={statistics}
							margin={{
								top: 5,
								right: 30,
								left: 30,
								bottom: 5,
							}}
						>
							<CartesianGrid strokeDasharray="1 2" strokeWidth={0.5} />

							<XAxis
								dataKey="monthName"
								interval={0}
								scale="band"
								textAnchor="middle"
							/>

							<YAxis
								tickFormatter={(e: number) =>
									humanReadableTime(
										settings.displayTime.showTimeInHours,
										e,
										true,
									)
								}
								axisLine={false}
								width={75}
								type="number"
								domain={["auto", (dataMax: number) => dataMax * 1.15]}
								tickCount={6}
							/>

							<Bar
								dataKey="total"
								fill="#008ADA"
								barSize={20}
								stackId="month-bar"
							/>

							<Bar
								dataKey="migrated"
								fill="#FFD500"
								barSize={20}
								stackId="month-bar"
							>
								<LabelList
									valueAccessor={(data: { value: number | Array<number> }) => {
										if (Array.isArray(data.value)) {
											// NOTE(ynhhoJ): Recharts `values` can have duplicates.
											//               `new Set()` will help to calculate only unique sessions
											//               playtime
											const uniqueSessions = new Set(...[data.value]);
											const uniqueSessionsAsArray = [...uniqueSessions];
											let total = 0;

											for (const time of uniqueSessionsAsArray) {
												total += time;
											}

											return total === 0
												? ""
												: humanReadableTime(
														settings.displayTime.showTimeInHours,
														total,
													);
										}

										return data.value === 0
											? ""
											: humanReadableTime(
													settings.displayTime.showTimeInHours,
													data.value,
												);
									}}
									fill="white"
									position="top"
								/>

								<Legend />
							</Bar>
						</ComposedChart>
					</ResponsiveContainer>
				</div>
			</div>
		</FocusableExt>
	);
}
