import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardHeader, CardDescription, CardFooter } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

function AnimatedValue({ value, loading, keyPrefix = "", className = "", onClick }: { value: number; loading: boolean; keyPrefix?: string; className?: string; onClick?: () => void }) {
    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={keyPrefix + (loading ? "-loading" : value)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className={`text-xl font-semibold tabular-nums ${className} ${onClick ? 'cursor-pointer hover:text-primary' : ''}`}
                onClick={onClick}
            >
                {loading ? <Spinner className="size-5" /> : value}
            </motion.div>
        </AnimatePresence>
    );
}

export type AnalyticsCardFields = {
    [tabKey: string]: {
        main: string;
        today?: string;
        mtd?: string;
    };
};

export type AnalyticsCardTab = {
    key: string;
    label: string;
};

export function AnalyticsCard({
    label,
    fields,
    analytics,
    loading,
    tabs = [
        { key: "open", label: "Open" },
        { key: "closed", label: "Closed" },
        { key: "resolved", label: "Resolved" },
        { key: "total", label: "Total" },
    ],
    singleValue = false,
    onValueClick,
}: {
    label: string;
    fields: AnalyticsCardFields;
    analytics: any;
    loading: boolean;
    tabs?: AnalyticsCardTab[];
    singleValue?: boolean;
    onValueClick?: (() => void) | undefined;
}) {
    const [tab, setTab] = useState<string>(tabs[0].key);

    const getTabValues = () => {
        if (!analytics) return { main: 0, today: 0, mtd: 0 };
        const mapping = fields[tab];
        if (!mapping) return { main: 0, today: 0, mtd: 0 };
        // For singleValue, search all root keys for the value
        if (singleValue) {
            // Try till_date, todays, mtd, or root
            let value = 0;
            if (mapping.main && analytics.till_date && analytics.till_date[mapping.main] !== undefined) {
                value = analytics.till_date[mapping.main];
            } else if (mapping.main && analytics.todays && analytics.todays[mapping.main] !== undefined) {
                value = analytics.todays[mapping.main];
            } else if (mapping.main && analytics.mtd && analytics.mtd[mapping.main] !== undefined) {
                value = analytics.mtd[mapping.main];
            } else if (mapping.main && analytics[mapping.main] !== undefined) {
                value = analytics[mapping.main];
            }
            return { main: value };
        }

        // Special logic for 'total' tab: sum all other tabs' values
        if (tab === "total" && Object.keys(fields).length > 1) {
            // Sum all main/today/mtd for all tabs except 'total'
            let main = 0, today = 0, mtd = 0;
            Object.entries(fields).forEach(([k, v]) => {
                if (k === "total") return;
                if (v.main) main += analytics.till_date?.[v.main] || 0;
                if (v.today) today += analytics.todays?.[v.today] || 0;
                if (v.mtd) mtd += analytics.mtd?.[v.mtd] || 0;
            });
            return { main, today, mtd };
        }

        return {
            main: analytics.till_date[mapping.main] || 0,
            today: mapping.today ? analytics.todays[mapping.today] || 0 : 0,
            mtd: mapping.mtd ? analytics.mtd[mapping.mtd] || 0 : 0,
        };
    };
    const { main, today, mtd } = getTabValues();
    const tabLabel = tabs.find(t => t.key === tab)?.label || tab;

    return (
        <Card className="@container/card gap-2 py-4">
            <CardHeader className="px-2">
                <CardDescription className="px-2 text-base">{label}</CardDescription>
                <Tabs value={tab} onValueChange={v => setTab(v as any)} className="w-full">
                    <TabsList className="mb-2 w-full">
                        {tabs.map(t => (
                            <TabsTrigger key={t.key} value={t.key}>{t.label}</TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </CardHeader>
            {singleValue ? (
                <CardFooter className="w-full flex-row items-center gap-0 text-base font-semibold justify-center min-h-[4.5rem]">
                    {label === "Users" && tab === "loggedin" ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <AnimatedValue value={main} loading={loading} keyPrefix={tab + "-main-" + label} className="text-4xl md:text-4xl font-extrabold tracking-tight mt-3" onClick={onValueClick} />
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Click the count to view logged in Field Agents Today</TooltipContent>
                        </Tooltip>
                    ) : label === "Users" && tab === "registered" ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <AnimatedValue value={main} loading={loading} keyPrefix={tab + "-main-" + label} className="text-4xl md:text-4xl font-extrabold tracking-tight mt-3" />
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">This value represents registered users this month</TooltipContent>
                        </Tooltip>
                    ) : label === "Users" && tab === "total" ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <AnimatedValue value={main} loading={loading} keyPrefix={tab + "-main-" + label} className="text-4xl md:text-4xl font-extrabold tracking-tight mt-3" />
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Users registered till date</TooltipContent>
                        </Tooltip>
                    ) : (
                        <AnimatedValue value={main} loading={loading} keyPrefix={tab + "-main-" + label} className="text-4xl md:text-4xl font-extrabold tracking-tight mt-3" onClick={tab === 'loggedin' ? onValueClick : undefined} />
                    )}
                </CardFooter>
            ) : (
                <CardFooter className="w-full flex-row items-center gap-0 text-base font-semibold justify-between min-h-[4.5rem]">
                    <div className="flex-1 flex flex-col items-center">
                        <div className="text-sm text-foreground font-light">Today</div>
                        <AnimatedValue value={today} loading={loading} keyPrefix={tab + "-today-" + label} />
                    </div>
                    <Separator orientation="vertical" className="mx-2 h-10" />
                    <div className="flex-1 flex flex-col items-center">
                        <div className="text-sm text-foreground font-light">MTD</div>
                        <AnimatedValue value={mtd} loading={loading} keyPrefix={tab + "-mtd-" + label} />
                    </div>
                    <Separator orientation="vertical" className="mx-2 h-10" />
                    <div className="flex-1 flex flex-col items-center">
                        <div className="text-sm text-foreground font-light">Till Date</div>
                        <AnimatedValue value={main} loading={loading} keyPrefix={tab + "-main-" + label} />
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
