import { Inbox, FileText, CalendarDays, IndianRupee } from "lucide-react";

import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { QuotationStatusChart } from "@/components/dashboard/QuotationStatusChart";
import { EnquiryTrendChart } from "@/components/dashboard/EnquiryTrendChart";
import { FollowUpPanel } from "@/components/dashboard/FollowUpPanel";
import { RecentQuotationsTable } from "@/components/dashboard/RecentQuotationsTable";
import { UpcomingEventsList } from "@/components/dashboard/UpcomingEventsList";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { currentUser, kpis } from "@/data/mockData";
import { formatINR } from "@/lib/format";

export function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <WelcomeSection
        name={currentUser.name.split(" ")[0]}
        onNewEnquiry={() => {}}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={Inbox}
          label="Total Enquiries"
          value={kpis.totalEnquiries.value.toString()}
          delta={kpis.totalEnquiries.delta}
          sublabel="vs last month"
        />
        <KpiCard
          icon={FileText}
          label="Active Quotations"
          value={kpis.activeQuotations.value.toString()}
          delta={kpis.activeQuotations.delta}
          sublabel={`${kpis.activeQuotations.pendingRevisions} pending revisions`}
        />
        <KpiCard
          icon={CalendarDays}
          label="Upcoming Events"
          value={kpis.upcomingEvents.value.toString()}
          delta={kpis.upcomingEvents.delta}
          sublabel="next 30 days"
        />
        <KpiCard
          icon={IndianRupee}
          label="Monthly Revenue"
          value={formatINR(kpis.monthlyRevenue.value)}
          delta={kpis.monthlyRevenue.delta}
          sublabel="vs last month"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <QuotationStatusChart />
        </div>
        <div className="lg:col-span-5">
          <EnquiryTrendChart />
        </div>
        <div className="lg:col-span-3">
          <FollowUpPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <RecentQuotationsTable />
        </div>
        <div className="lg:col-span-5">
          <UpcomingEventsList />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <ActivityTimeline />
        </div>
        <div className="lg:col-span-4">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
