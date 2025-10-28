"use client";
import { useEffect } from "react";
import { ChartAreaInteractive } from "./components/chart-area-interactive";
import { DataTable } from "./components/data-table";
import data from "./components/data.json";
import { SectionCards } from "./components/section-cards";
import { defaultDashboardServices } from "./services";
import { authUtils } from "@/lib/auth-utils";


export default function Page() {
  useEffect(() => {
    const token = authUtils.getToken();
    if (!token) return;
    // Call all dashboard APIs in parallel
    Promise.all([
      defaultDashboardServices.getTimezones(token),
      defaultDashboardServices.getUserAccessPermission(token),
      defaultDashboardServices.getStepsStatus(token),
      defaultDashboardServices.validateToken(token),
      defaultDashboardServices.getLoginStatus(token),
      defaultDashboardServices.getDashboardAnalytics(token),
      defaultDashboardServices.getLanguageList(token),
    ]).then(([
      timezones,
      userAccessPermission,
      stepsStatus,
      validateToken,
      loginStatus,
      dashboardAnalytics,
      languageList,
    ]) => {
      // For now, just log the results. Replace with state setters as needed.
      console.log({
        timezones,
        userAccessPermission,
        stepsStatus,
        validateToken,
        loginStatus,
        dashboardAnalytics,
        languageList,
      });
    });
  }, []);

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <SectionCards />
      <ChartAreaInteractive />
      <DataTable data={data} />
    </div>
  );
}
