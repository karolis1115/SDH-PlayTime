import { isNil } from "@src/utils/isNil";
import type { FC } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts";
import { FocusableExt } from "../FocusableExt";

interface TimeByGame {
	gameId: string;
	gameName: string;
	totalTime: number;
}

const colors = [
	"#0b84a5",
	"#f6c85f",
	"#6f4e7c",
	"#9dd866",
	"#ca472f", // Color for "Other"
];

function isDailyStatistics(
	statistics: Array<DailyStatistics | GamePlaytimeDetails>,
): statistics is Array<DailyStatistics> {
	return (statistics[0] as DailyStatistics)?.games !== undefined;
}

export const PieView: FC<{
	statistics: Array<DailyStatistics> | Array<GamePlaytimeDetails>;
}> = ({ statistics }) => {
	if (isNil(statistics) || statistics.length === 0) {
		return undefined;
	}

	let raw_data: Array<{ name: string; value: number }>;

	if (isDailyStatistics(statistics)) {
		raw_data = sumTimeAndGroupByGame(statistics)
			.map((value) => {
				return {
					name: value.gameName,
					value: value.totalTime / 60.0,
				};
			})
			.sort((a, b) => b.value - a.value);
	} else {
		raw_data = statistics
			.sort((a, b) => b.totalTime - a.totalTime)
			.map((item) => ({
				name: item.game.name,
				value: item.totalTime / 60.0,
			}));
	}

	const MAX_ELEMENTS = colors.length - 1;

	const top_elements = raw_data.slice(0, MAX_ELEMENTS);
	const other_elements = raw_data.slice(MAX_ELEMENTS);
	const other = {
		name: "Other",
		value: other_elements.reduce((acc, curr) => acc + curr.value, 0),
	};

	let data = [];
	if (other.value > 0) {
		data = [...top_elements, other];
	} else {
		data = top_elements;
	}

	const RADIAN = Math.PI / 180;

	const renderCustomizedLabel = ({
		cx,
		cy,
		midAngle,
		innerRadius,
		outerRadius,
		percent,
	}: {
		cx: number;
		cy: number;
		midAngle: number;
		innerRadius: number;
		outerRadius: number;
		percent: number;
	}) => {
		const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
		const x = cx + radius * Math.cos(-midAngle * RADIAN);
		const y = cy + radius * Math.sin(-midAngle * RADIAN);

		return (
			<text
				x={x}
				y={y}
				fill="white"
				textAnchor={x > cx ? "start" : "end"}
				dominantBaseline="central"
			>
				{`${(percent * 100).toFixed(0)}%`}
			</text>
		);
	};

	return (
		<FocusableExt>
			<div className="pie-by-week" style={{ width: "100%", height: 300 }}>
				<ResponsiveContainer>
					<PieChart>
						<Pie
							dataKey="value"
							isAnimationActive={false}
							data={data}
							fill="#0088FE"
							labelLine={false}
							label={renderCustomizedLabel}
							legendType="circle"
						>
							{data.map((gameInformation, index) => (
								<Cell
									key={`cell-${gameInformation.name}`}
									fill={colors[index]}
								/>
							))}
						</Pie>
						<Legend cx="30%" verticalAlign="bottom" />
					</PieChart>
				</ResponsiveContainer>
			</div>
		</FocusableExt>
	);
};

function sumTimeAndGroupByGame(statistics: DailyStatistics[]): TimeByGame[] {
	const timeByGameId = new Map<string, number>();
	const titleByGameId = new Map<string, string>();

	for (const el of statistics.flatMap((it) => it.games)) {
		timeByGameId.set(
			el.game.id,
			(timeByGameId.get(el.game.id) || 0) + el.totalTime,
		);
		titleByGameId.set(el.game.id, el.game.name);
	}

	const timeByGames: TimeByGame[] = [];

	timeByGameId.forEach((v, k) => {
		timeByGames.push({
			gameId: k,
			gameName: titleByGameId.get(k) || "Unknown",
			totalTime: v,
		} as TimeByGame);
	});

	timeByGames.sort((a, b) => b.totalTime - a.totalTime);

	return timeByGames;
}
