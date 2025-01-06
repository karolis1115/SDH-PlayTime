import type { Button } from "./enums/Button";

// NOTE(ynhhoJ): https://discordapp.com/channels/960281551428522045/960284311444131840/1221486251559878786
export function registerForInputEvent(
	callback: (buttons: Button[], rawEvent: ControllerStateChange[]) => void,
): Unregisterable {
	return SteamClient.Input.RegisterForControllerStateChanges((changes) => {
		const buttons: Button[] = [];

		for (const change of changes) {
			const lower_buttons = change.ulButtons
				.toString(2)
				.padStart(32, "0")
				.split("");

			for (const [index, value] of lower_buttons.entries()) {
				if (value === "1") {
					buttons.push((31 - index) as Button);
				}
			}

			const upper_buttons = change.ulUpperButtons
				.toString(2)
				.padStart(32, "0")
				.split("");

			for (const [index, value] of upper_buttons.entries()) {
				if (value === "1") {
					buttons.push((63 - index) as Button);
				}
			}
		}

		callback(buttons, changes);
	});
}
