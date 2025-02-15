import { isNil } from "@src/utils/isNil";
import { getGameCoverImageMemo } from "@src/utils/steam/getGameCoverImage";
import Card from "../styles/card.css";

interface GameCardProperties {
	gameId: string;
	coverScale?: number;
}

export function getGameCoverImage(gameId: string) {
	const image = getGameCoverImageMemo(gameId);

	if (isNil(image)) {
		return "url(/images/defaultappimage.png)";
	}

	return `url(${image}), url(${image.replace("png", "jpg")})`;
}

export function GameCoverStyle() {
	return <style>{Card}</style>;
}

export function GameCard({ gameId, coverScale = 1 }: GameCardProperties) {
	const url = getGameCoverImage(gameId);

	return (
		<div
			className="cards"
			style={{
				gridTemplateColumns: `repeat(auto-fill, ${60 * coverScale}px)`,
				gridAutoRows: `${90 * coverScale}px`,
			}}
		>
			<div className="card _54PuCatl_tYG836TOs4Mv">
				<div className="main-cover">
					<div className="inline-block cover-background aspect-ratio absolute-full-height unknown-b unknown-a">
						<div
							className="full-width-block opacity-transition"
							style={{
								backgroundImage: url,
								backgroundSize: "cover",
							}}
						/>
					</div>
				</div>

				<div
					className="background-overlay"
					style={{
						backgroundImage: url,
						backgroundSize: "cover",
					}}
				/>
			</div>
		</div>
	);
}
