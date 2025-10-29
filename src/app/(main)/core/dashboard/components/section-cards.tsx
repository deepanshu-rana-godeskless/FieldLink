"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { defaultDashboardServices } from "../services";
import { authUtils } from "@/lib/auth-utils";
import { AnalyticsCard, AnalyticsCardFields } from "./analytics-card";
import { LoggedInUsersDrawer } from "./LoggedInUsersDrawer";
import { UtilizationDrawer } from "./UtilizationDrawer";

// -------------------------------
// Types
// -------------------------------
type AnalyticsData = {
  till_date: Record<string, number>;
  todays: Record<string, number>;
  mtd: Record<string, number>;
  [key: string]: any;
};

// -------------------------------
// Component
// -------------------------------
export function SectionCards() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLoggedInDrawer, setShowLoggedInDrawer] = useState(false);
  // Track the current Utilization tab
  const [utilizationTab, setUtilizationTab] = useState<"video" | "sms" | "whatsapp">("video");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const token = authUtils.getToken();
        if (!token) return;

        const res = await defaultDashboardServices.getDashboardAnalytics(token);
        if (res?.status && Array.isArray(res.data) && res.data.length > 0) {
          setAnalytics(res.data[0]);
        }
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // -------------------------------
  // Field mappings
  // -------------------------------
  const ticketFields: AnalyticsCardFields = {
    open: {
      main: "open_tickets_cnt",
      today: "todays_open_tickets_cnt",
      mtd: "mtd_open_tickets_cnt",
    },
    closed: {
      main: "closed_tickets_cnt",
      today: "todays_closed_tickets_cnt",
      mtd: "mtd_closed_tickets_cnt",
    },
    resolved: {
      main: "resolved_tickets_cnt",
      today: "todays_resolved_tickets_cnt",
      mtd: "mtd_resolved_tickets_cnt",
    },
    total: {
      main: "total_tickets_cnt",
      today: "todays_total_tickets_cnt",
      mtd: "mtd_total_tickets_cnt",
    },
  };

  const visitFields: AnalyticsCardFields = {
    open: {
      main: "open_visits_cnt",
      today: "todays_open_visits_cnt",
      mtd: "mtd_open_visits_cnt",
    },
    closed: {
      main: "closed_visits_cnt",
      today: "todays_closed_visits_cnt",
      mtd: "mtd_closed_visits_cnt",
    },
    resolved: {
      main: "resolved_visits_cnt",
      today: "todays_resolved_visits_cnt",
      mtd: "mtd_resolved_visits_cnt",
    },
    total: {
      main: "total_visits_cnt",
      today: "todays_total_visits_cnt",
      mtd: "mtd_total_visits_cnt",
    },
  };

  const usersFields = {
    loggedin: { main: "todays_logged_in_usr_cnt" },
    registered: { main: "mtd_registered_user_cnt" },
    total: { main: "total_user_cnt" },
  };

  const usersTabs = [
    { key: "loggedin", label: "Logged In" },
    { key: "registered", label: "Registered" },
    { key: "total", label: "Total" },
  ];

  // Utilization fields and tabs
  const utilizationFields = {
    video: { main: "total_video" },
    sms: { main: "total_sms" },
    whatsapp: { main: "total_whatsapp" },
  };
  const utilizationTabs = [
    { key: "video", label: "Video" },
    { key: "sms", label: "SMS" },
    { key: "whatsapp", label: "WhatsApp" },
  ];

  const [utilizationDrawer, setUtilizationDrawer] = useState<{ open: boolean; category: "video" | "sms" | "whatsapp" }>({ open: false, category: "video" });

  // -------------------------------
  // Render
  // -------------------------------
  return (
    <>
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {/* Tickets Card */}
        <AnalyticsCard
          label="Tickets"
          fields={ticketFields}
          analytics={analytics}
          loading={loading}
        />

        {/* Visits Card */}
        <AnalyticsCard
          label="Visits"
          fields={visitFields}
          analytics={analytics}
          loading={loading}
        />

        {/* Users Card */}
        <AnalyticsCard
          label="Users"
          fields={usersFields}
          analytics={analytics}
          loading={loading}
          tabs={usersTabs}
          singleValue
          onValueClick={() => setShowLoggedInDrawer(true)}
        />

        {/* Utilization Card */}
        <AnalyticsCard
          label="Utilization"
          fields={utilizationFields}
          analytics={analytics}
          loading={loading}
          tabs={utilizationTabs}
          singleValue
          tab={utilizationTab}
          setTab={(tab) => setUtilizationTab(tab as "video" | "sms" | "whatsapp")}
          onValueClick={(tabKey) => setUtilizationDrawer({ open: true, category: tabKey as "video" | "sms" | "whatsapp" })}
        />
      </div>

      {/* Drawer for logged in users */}
      <LoggedInUsersDrawer
        open={showLoggedInDrawer}
        onClose={() => setShowLoggedInDrawer(false)}
      />
      {/* Drawer for utilization details */}
      <UtilizationDrawer
        open={utilizationDrawer.open}
        onClose={() => setUtilizationDrawer({ ...utilizationDrawer, open: false })}
        category={utilizationDrawer.category}
      />
    </>
  );
}
