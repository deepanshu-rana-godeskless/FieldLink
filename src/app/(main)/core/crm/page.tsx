import { InsightCards } from "./components/insight-cards";
import { OperationalCards } from "./components/operational-cards";
import { OverviewCards } from "./components/overview-cards";
import { TableCards } from "./components/table-cards";

export default function Page() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <OverviewCards />
      <InsightCards />
      <OperationalCards />
      <TableCards />
    </div>
  );
}
