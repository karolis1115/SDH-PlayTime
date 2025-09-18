import { DialogButton, Focusable, findClass, findSP } from "@decky/ui";
import { registerForInputEvent } from "@src/steam/registerForInputEvent";
import { isNil } from "@src/utils/isNil";
import { useEffect, useState } from "react";
import { focus_panel_no_padding, pager_container } from "../styles";

async function focusOnCurrentActiveTab(): Promise<boolean> {
	return new Promise((resolve) => {
		const selectedTab = findSP().document.querySelector(
			`.${findClass("62645", "Selected")}`,
		);

		if (isNil(selectedTab)) {
			resolve(false);

			return;
		}

		(selectedTab as HTMLElement).focus();

		queueMicrotask(() => {
			resolve(true);
		});
	});
}

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
		const unregisterRegisterForInputEvent = registerForInputEvent(
			async (_buttons, rawEvent) => {
				if (!isEnabledChangePagesWithTriggers) {
					return;
				}

				if (rawEvent.length === 0) {
					return;
				}

				const DELAY = 500;

				if (Date.now() - lastChangedPageTimeStamp <= DELAY) {
					return;
				}

				const { sTriggerL, sTriggerR } = rawEvent[0];

				if (sTriggerL === 0 && sTriggerR === 0) {
					return;
				}

				// NOTE(ynhhoJ): Aproximative value
				const TRIGGER_PUSH_FORCE_UNTIL_VIBRATION = 12000;
				const isLeftTriggerPressed =
					rawEvent[0].sTriggerL >= TRIGGER_PUSH_FORCE_UNTIL_VIBRATION;

				if (isLeftTriggerPressed && hasPrev) {
					await focusOnCurrentActiveTab();

					setLastChangedPageTimeStamp(Date.now());

					onPrev();
				}

				const isRightTriggerPressed =
					rawEvent[0].sTriggerR >= TRIGGER_PUSH_FORCE_UNTIL_VIBRATION;

				if (isRightTriggerPressed && hasNext) {
					await focusOnCurrentActiveTab();

					setLastChangedPageTimeStamp(Date.now());

					onNext();
				}
			},
		);

		return () => {
			unregisterRegisterForInputEvent?.unregister();
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
