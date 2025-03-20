import { DialogButton, Focusable } from "@decky/ui";
import { registerForInputEvent } from "@src/steam/registerForInputEvent";
import { useEffect, useState } from "react";
import { focus_panel_no_padding, pager_container } from "../styles";

export const Pager: React.FC<{
	currentText: string;
	onNext: () => void;
	onPrev: () => void;
	hasNext: boolean;
	hasPrev: boolean;
	prevKey?: "l2";
	nextKey?: "r2";
	isEnabledChangePagesWithTriggers?: boolean;
}> = ({
	currentText,
	prevKey = "l2",
	hasNext,
	hasPrev,
	onNext,
	onPrev,
	nextKey = "r2",
	isEnabledChangePagesWithTriggers = false,
}) => {
	const [lastChangedPageTimeStamp, setLastChangedPageTimeStamp] =
		useState<number>(0);

	useEffect(() => {
		const { unregister } = registerForInputEvent((_buttons, rawEvent) => {
			if (!isEnabledChangePagesWithTriggers) {
				return;
			}

			if (rawEvent.length === 0) {
				return;
			}

			const DELAY = 500;

			if (new Date().getTime() - lastChangedPageTimeStamp <= DELAY) {
				return;
			}

			// NOTE(ynhhoJ): Aproximative value
			const TRIGGER_PUSH_FORCE_UNTIL_VIBRATION = 12000;
			const isLeftTriggerPressed =
				rawEvent[0].sTriggerL >= TRIGGER_PUSH_FORCE_UNTIL_VIBRATION;

			if (isLeftTriggerPressed && hasPrev) {
				setLastChangedPageTimeStamp(new Date().getTime());

				onPrev();
			}

			const isRightTriggerPressed =
				rawEvent[0].sTriggerR >= TRIGGER_PUSH_FORCE_UNTIL_VIBRATION;

			if (isRightTriggerPressed && hasNext) {
				setLastChangedPageTimeStamp(new Date().getTime());

				onNext();
			}
		});

		return () => {
			unregister();
		};
	});

	return (
		<Focusable
			style={{ ...pager_container, ...focus_panel_no_padding }}
			flow-children="horizontal"
		>
			{prevKey && isEnabledChangePagesWithTriggers && (
				<img
					src={`/steaminputglyphs/sd_${prevKey}.svg`}
					alt={prevKey}
					style={{
						opacity: hasPrev ? 1 : 0.5,
						width: "32px",
						height: "32px",
						position: "absolute",
						left: "2.8vw",
					}}
				/>
			)}

			<DialogButton
				style={{
					minWidth: "0px",
					padding: "10px 10px",
					width: "35px",
					margin: "0 2.8vw",
				}}
				disabled={!hasPrev}
				onClick={onPrev}
			>
				&lt;
			</DialogButton>

			<div className="title">{currentText}</div>

			<DialogButton
				style={{
					minWidth: "0px",
					padding: "10px 10px",
					width: "35px",
					margin: "0 2.8vw",
				}}
				disabled={!hasNext}
				onClick={onNext}
			>
				&gt;
			</DialogButton>

			{nextKey && isEnabledChangePagesWithTriggers && (
				<img
					src={`/steaminputglyphs/sd_${nextKey}.svg`}
					alt={nextKey}
					style={{
						opacity: hasNext ? 1 : 0.5,
						width: "32px",
						height: "32px",
						position: "absolute",
						right: "2.8vw",
					}}
				/>
			)}
		</Focusable>
	);
};
