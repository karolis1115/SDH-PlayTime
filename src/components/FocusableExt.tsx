import { Focusable } from "@decky/ui";
import type { CSSProperties } from "react";
import { focus_panel_no_padding } from "../styles";

interface FocusableExtProperties {
	autoFocus?: boolean;
	children: JSX.Element | Array<JSX.Element>;
	focusWithinClassName?: string;
	onActivate?: () => void;
	onMenuActionDescription?: JSX.Element;
	onMenuButton?: () => void;
	onOptionsActionDescription?: JSX.Element;
	onOptionsButton?: () => void;
	style?: CSSProperties;
}

export const FocusableExt: React.FC<FocusableExtProperties> = ({
	autoFocus = undefined,
	children,
	focusWithinClassName,
	onActivate = () => {},
	onMenuActionDescription,
	onMenuButton,
	onOptionsActionDescription,
	onOptionsButton,
	style = {},
}) => {
	return (
		<Focusable
			focusWithinClassName={focusWithinClassName}
			onActivate={onActivate}
			onOptionsActionDescription={onOptionsActionDescription}
			onOptionsButton={onOptionsButton}
			style={{ ...focus_panel_no_padding, ...style }}
			autoFocus={autoFocus}
			onMenuActionDescription={onMenuActionDescription}
			onMenuButton={onMenuButton}
		>
			{children}
		</Focusable>
	);
};
