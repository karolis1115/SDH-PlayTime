import { HorizontalContainerCSS } from "../styles";

interface HorizontalContainerProperties {
	children: JSX.Element | Array<JSX.Element>;
}

export const HorizontalContainer: React.FC<HorizontalContainerProperties> = ({
	children,
}) => {
	return (
		<div style={HorizontalContainerCSS.horizontal__container}>{children}</div>
	);
};
