import { Tabs } from "@decky/ui";
import { useEffect, useState } from "react";
import { PageWrapper } from "../components/PageWrapper";
import { Tab } from "../components/Tab";
import { ReportMonthly } from "../containers/ReportMonthly";
import { ReportOverall } from "../containers/ReportOverall";
import { ReportWeekly } from "../containers/ReportWeekly";
import { $lastOpenedPage } from "@src/stores/ui";

export const DetailedPage = () => {
	const [currentTabRoute, setCurrentTabRoute] = useState<ReportPage>(
		$lastOpenedPage.get(),
	);

	useEffect(() => {
		$lastOpenedPage.set(currentTabRoute);

		return () => {
			$lastOpenedPage.set("all-time");
		};
	}, [currentTabRoute]);

	return (
		<PageWrapper>
			<Tabs
				activeTab={currentTabRoute}
				onShowTab={(tabId: ReportPage) => {
					setCurrentTabRoute(tabId);
				}}
				autoFocusContents={true}
				tabs={[
					{
						title: "All Time",
						content: (
							<Tab>
								<ReportOverall />
							</Tab>
						),
						id: "all-time",
					},
					{
						title: "By Month",
						content: (
							<Tab>
								<ReportMonthly />
							</Tab>
						),
						id: "by-month",
					},
					{
						title: "By Week",
						content: (
							<Tab>
								<ReportWeekly />
							</Tab>
						),
						id: "by-week",
					},
				]}
			/>
		</PageWrapper>
	);
};
