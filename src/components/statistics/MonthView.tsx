import moment from "moment";
import type { FC } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";
import { humanReadableTime } from "../../app/formatters";
import type { DailyStatistics } from "../../app/model";
import { FocusableExt } from "../FocusableExt";

interface DayTime {
	time: number;
	date: Date;
}

export const MonthView: FC<{ statistics: DailyStatistics[] }> = (props) => {
	const dayTimes = props.statistics.map((it) => {
		return {
			time: it.total,
			date: moment(it.date).toDate(),
		} as DayTime;
	});

	return (
		<FocusableExt>
			<div className="playtime-chart">
				<div className="bar-by-month" style={{ width: "100%", height: 300 }}>
					<ResponsiveContainer>
						<BarChart
							data={dayTimes.map((value) => {
								return {
									day: value.date.getDate(),
									time: value.time,
								};
							})}
							margin={{
								top: 5,
								right: 30,
								left: 20,
								bottom: 5,
							}}
						>
							<CartesianGrid strokeDasharray="1 2" strokeWidth={0.5} />

							<XAxis
								dataKey="day"
								interval={0}
								scale="time"
								angle={-90}
								textAnchor="end"
							/>

							<YAxis
								axisLine={false}
								domain={["auto", (dataMax: number) => dataMax * 1.05]}
								tickFormatter={(e: number) => humanReadableTime(e, true)}
								width={75}
							/>
							<Bar dataKey="time" fill="#008ADA" />
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>
		</FocusableExt>
	);
};
