import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { EnquiryKpiRow } from "@/components/enquiries/EnquiryKpiRow";
import {
  EnquiryFilters,
  type SourceFilter,
  type StatusFilter,
} from "@/components/enquiries/EnquiryFilters";
import { EnquiriesTable } from "@/components/enquiries/EnquiriesTable";
import { AddEnquiryDrawer } from "@/components/enquiries/AddEnquiryDrawer";
import { ViewEnquiryDrawer } from "@/components/enquiries/ViewEnquiryDrawer";
import { enquiries as allEnquiries } from "@/data/mockData";
import type { Enquiry } from "@/types";

const PAGE_SIZE = 6;

export function Enquiries() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [viewEnquiry, setViewEnquiry] = useState<Enquiry | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return allEnquiries.filter((enquiry) => {
      const matchesSearch =
        query.length === 0 ||
        enquiry.customerName.toLowerCase().includes(query) ||
        enquiry.venue.toLowerCase().includes(query) ||
        enquiry.id.toLowerCase().includes(query);

      const matchesSource =
        sourceFilter === "all" ||
        (sourceFilter === "unassigned"
          ? enquiry.assignedStaff === null
          : enquiry.source === sourceFilter);

      const matchesStatus = statusFilter === "all" || enquiry.status === statusFilter;

      return matchesSearch && matchesSource && matchesStatus;
    });
  }, [search, sourceFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function updateFilter<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  function goToQuotationBuilder(enquiry: Enquiry) {
    setAddOpen(false);
    setViewEnquiry(null);
    navigate("/quotations", { state: { fromEnquiry: enquiry } });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">
            Enquiries & Leads
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage and convert incoming event requests from all channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary">
            <Download className="size-4" />
            Export List
          </Button>
          <Button size="lg" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" />
            Add New Enquiry
          </Button>
        </div>
      </div>

      <EnquiryKpiRow />

      <EnquiryFilters
        search={search}
        onSearchChange={updateFilter(setSearch)}
        sourceFilter={sourceFilter}
        onSourceFilterChange={updateFilter(setSourceFilter)}
        statusFilter={statusFilter}
        onStatusFilterChange={updateFilter(setStatusFilter)}
      />

      <EnquiriesTable
        enquiries={pageItems}
        onRowClick={setViewEnquiry}
        onGenerateQuote={goToQuotationBuilder}
      />

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-xs font-semibold text-muted">
          {filtered.length === 0
            ? "No enquiries found"
            : `Showing ${(currentPage - 1) * PAGE_SIZE + 1} to ${Math.min(
                currentPage * PAGE_SIZE,
                filtered.length
              )} of ${filtered.length} enquiries`}
        </p>
        <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <AddEnquiryDrawer
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreateQuotation={() => navigate("/quotations")}
      />

      <ViewEnquiryDrawer
        enquiry={viewEnquiry}
        onOpenChange={(open) => !open && setViewEnquiry(null)}
        onGenerateQuote={goToQuotationBuilder}
      />
    </div>
  );
}
