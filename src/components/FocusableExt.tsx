import { Focusable } from "@decky/ui";
import { focus_panel_no_padding } from "../styles";

interface FocusableExtProperties {
	children: JSX.Element;
}

export const FocusableExt: React.FC<FocusableExtProperties> = ({
	children,
}) => {
	return (
		<Focusable style={focus_panel_no_padding} onActivate={() => {}}>
			{children}
		</Focusable>
	);
};
