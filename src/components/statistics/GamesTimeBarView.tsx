import type { GameWithTime } from "../../app/model";
import { hide_text_on_overflow } from "../../styles";
import { FocusableExt } from "../FocusableExt";
import { Timebar } from "../Timebar";
import { VerticalContainer } from "../VerticalContainer";

export const GamesTimeBarView: React.FC<{ data: GameWithTime[] }> = (props) => {
	const allTime = props.data.reduce((acc, it) => acc + it.time, 0);
	const sortedByTime = props.data.sort((a, b) => b.time - a.time);

	return (
		<div className="games-by-week">
			{sortedByTime.map((it, index) => (
				<FocusableExt key={`${it.game.name}${index}`}>
					<VerticalContainer>
						<div style={hide_text_on_overflow}>{it.game.name}</div>
						<Timebar time={it.time} allTime={allTime} />
					</VerticalContainer>
				</FocusableExt>
			))}
		</div>
	);
};
