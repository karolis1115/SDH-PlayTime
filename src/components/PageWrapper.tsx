interface PageWrapperProperties {
	children: JSX.Element;
}

export const PageWrapper: React.FC<PageWrapperProperties> = ({ children }) => {
	return (
		<div
			style={{
				marginTop: "40px",
				height: "calc(100% - 40px)",
				background: "#0005",
			}}
		>
			{children}
		</div>
	);
};
