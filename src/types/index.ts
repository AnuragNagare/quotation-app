export type ClientType = "direct" | "hotel";

export type QuotationStatus =
  | "draft"
  | "sent"
  | "pending"
  | "approved"
  | "cancelled"
  | "revision";

export interface Quotation {
  id: string;
  number: string;
  customer: string;
  clientType: ClientType;
  amount: number;
  status: QuotationStatus;
  createdDate: string;
}

export interface FollowUp {
  id: string;
  customerName: string;
  quotationNumber: string;
  note: string;
  time: string;
  dueLabel: string;
}

export type EventStatus = "confirmed" | "tentative" | "cancelled";

export interface UpcomingEvent {
  id: string;
  day: string;
  month: string;
  name: string;
  venue: string;
  status: EventStatus;
}

export type ActivityKind =
  | "quotation_created"
  | "revision_requested"
  | "invoice_generated"
  | "quotation_approved"
  | "equipment_assigned";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  message: string;
  user: string;
  time: string;
}

export interface EnquiryTrendPoint {
  date: string;
  enquiries: number;
  approved: number;
  cancelled: number;
}

export interface QuotationStatusSlice {
  label: string;
  value: number;
  percentage: number;
  revenue: number;
  colorVar: string;
}

export interface KpiCardData {
  label: string;
  value: string;
  delta: number;
  sublabel: string;
}

export type EnquirySource = "email" | "whatsapp" | "hotel_staff" | "website";

export type EnquiryStatus =
  | "new"
  | "quoted"
  | "followup"
  | "converted"
  | "closed";

export interface StaffMember {
  id: string;
  name: string;
}

export interface Enquiry {
  id: string;
  source: EnquirySource;
  customerName: string;
  clientType: ClientType;
  contact: string;
  eventType: string;
  eventDate: string;
  venue: string;
  assignedStaff: StaffMember | null;
  status: EnquiryStatus;
  createdDate: string;
}

export type EquipmentCategory =
  | "Audio"
  | "Visual"
  | "Lighting"
  | "Stage"
  | "Cables & Accessories";

export type StockStatus = "available" | "low_stock" | "in_maintenance";

export interface EquipmentCatalogItem {
  id: string;
  name: string;
  category: EquipmentCategory;
  unitPrice: number;
  sku: string;
  model: string;
  totalStock: number;
  availableStock: number;
  reservedStock: number;
  status: StockStatus;
  maintenanceNotes: string;
}

export interface QuotationLineItem {
  id: string;
  name: string;
  category: EquipmentCategory;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
}

export interface QuotationRevisionEntry {
  version: string;
  label: string;
  date: string;
  isCurrent: boolean;
}

// ─── Event Operations ──────────────────────────────────────────────────────

export type AvailabilityStatus =
  | "in_warehouse"
  | "reserved"
  | "out_for_maintenance";

export type PackingStatus = "pending" | "packed" | "loaded";

export type DispatchStageStatus = "completed" | "in_progress" | "pending";

export type EventOperationStatus = "confirmed" | "dispatched" | "completed";

export interface PackingItem {
  id: string;
  name: string;
  category: EquipmentCategory;
  requiredQty: number;
  availabilityStatus: AvailabilityStatus;
  packingStatus: PackingStatus;
  checked: boolean;
}

export interface DispatchStageItem {
  id: string;
  label: string;
  sublabel: string;
  status: DispatchStageStatus;
}

export interface EventOperation {
  id: string;
  linkedQuoteId: string;
  clientType: ClientType;
  status: EventOperationStatus;
  eventName: string;
  venue: string;
  venueAddress: string;
  eventDate: string;
  setupTime: string;
  specialInstructions: string;
  packingItems: PackingItem[];
  leadEngineer: StaffMember | null;
  crewMembers: StaffMember[];
  fieldContact: string;
  vehicleId: string;
  driverName: string;
  driverPhone: string;
  estimatedDispatchTime: string;
  dispatchStages: DispatchStageItem[];
}

export type EventDivision = "Audio" | "Visual" | "Lighting" | "Stage" | "Full Production";

export interface Expense {
  id: string;
  eventName: string;
  linkedQuoteId?: string;
  category: "Venue Fee" | "Logistics & Transport" | "Crew Allowance" | "Dry Hire Rental" | "Miscellaneous";
  amount: number;
  spentBy: string;
  date: string;
  notes?: string;
}

export interface QuotationDetail {
  id: string;
  enquiryId: string;
  status: QuotationStatus;
  revisionLabel: string;
  clientName: string;
  clientType: ClientType;
  recipientContact: string;
  eventName: string;
  eventDate: string;
  venue: string;
  lineItems: QuotationLineItem[];
  notes: string;
  terms: string;
  taxRatePercent: number;
  revisions: QuotationRevisionEntry[];
  division?: EventDivision;
  salesRep?: StaffMember | null;
  commissionPercent?: number;
}

// ─── Invoicing & Billing ───────────────────────────────────────────────────

export type PaymentStatus = "paid" | "unbilled" | "issued" | "overdue";

export interface InvoiceItem {
  id: string;
  number: string; // e.g. INV-2026-042
  customerName: string;
  clientType: ClientType;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  status: PaymentStatus;
  eventName?: string;
  linkedQuoteId?: string;
}

export interface HotelBatchEvent {
  id: string;
  eventDate: string;
  eventName: string;
  venue: string;
  linkedQuoteId: string;
  amount: number;
  status: PaymentStatus;
}

export interface HotelBatchGroup {
  id: string;
  hotelName: string;
  month: string;
  events: HotelBatchEvent[];
}

// ─── Customers & Hotel Partners (CRM) ──────────────────────────────────────

export type AccountStatus = "active" | "pending_billing";

export type BillingFormat = "pdf" | "excel";

export type BillingCycle = "immediate" | "eom";

export interface ContactPerson {
  name: string;
  phone: string;
  email: string;
}

export interface CustomerQuoteHistoryEntry {
  id: string;
  quoteNumber: string;
  status: QuotationStatus;
  eventName: string;
  eventDate: string;
  amount: number;
}

export interface CustomerAccount {
  id: string;
  name: string;
  clientType: ClientType;
  contactPerson: ContactPerson;
  location: string;
  billingAddress: string;
  taxDetails: string;
  bookedEvents: number;
  lifetimeValue: number;
  status: AccountStatus;
  billingFormat: BillingFormat;
  billingCycle: BillingCycle;
  activeEnquiries: number;
  hasOutstandingBalance: boolean;
  isTopTier: boolean;
  quoteHistory: CustomerQuoteHistoryEntry[];
}

// ─── Follow-ups & Reminders Hub ────────────────────────────────────────────

export type FollowUpChannel = "call" | "whatsapp" | "email";

export type FollowUpTimeSlot = "morning" | "afternoon" | "evening" | "overdue";

export type FollowUpStatusTag =
  | "pending_call"
  | "awaiting_reply"
  | "revision_requested"
  | "overdue_no_response"
  | "completed";

export type FollowUpOutcome =
  | "spoke_to_client"
  | "left_message"
  | "revision_requested"
  | "approved"
  | "declined";

export type FollowUpPriority = "high" | "normal";

export interface FollowUpConversationEntry {
  id: string;
  date: string;
  label: string;
  detail: string;
}

export interface FollowUpTask {
  id: string;
  quoteNumber: string;
  eventName: string;
  venue: string;
  amount: number;
  customerName: string;
  clientType: ClientType;
  contactPhone: string;
  dateLabel: string;
  scheduledTime: string;
  timeSlot: FollowUpTimeSlot;
  channel: FollowUpChannel;
  statusTag: FollowUpStatusTag;
  priority: FollowUpPriority;
  assignedStaff: StaffMember | null;
  conversation: FollowUpConversationEntry[];
  completed: boolean;
}

// ─── Reports & Management Analytics ────────────────────────────────────────

export type DateRangeKey = "this_month" | "last_month" | "this_quarter" | "this_year";

export type RevenueGranularity = "monthly" | "quarterly" | "yearly";

export interface RevenuePeriodPoint {
  period: string;
  direct: number;
  hotel: number;
}

export interface LeadSourceConversion {
  channel: EnquirySource;
  label: string;
  received: number;
  converted: number;
}

export interface EquipmentUtilizationSlice {
  id: string;
  label: string;
  utilizationPercent: number;
  colorVar: string;
}

export interface LossReason {
  id: string;
  reason: string;
  percentage: number;
}

export interface ReportsRangeData {
  label: string;
  totalRevenue: { value: number; delta: number };
  winRate: { value: number; delta: number };
  avgClosureDays: { value: number; delta: number };
  topSegment: { label: string; percentage: number };
  leadSourceConversion: LeadSourceConversion[];
  equipmentUtilization: EquipmentUtilizationSlice[];
  lossAnalysis: LossReason[];
}

// ─── Users & System Settings ────────────────────────────────────────────────

export type UserRole = "admin" | "sales" | "operations" | "finance";

export type UserStatus = "active" | "inactive";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
}

export interface RolePermissionStatement {
  id: string;
  label: string;
  allowed: boolean;
}

export type QuotationOutputFormat = "pdf" | "excel";

export interface SystemSettings {
  gstRatePercent: number;
  invoicePrefix: string;
  paymentReminderDays: number;
  directOutputFormat: QuotationOutputFormat;
  hotelOutputFormat: QuotationOutputFormat;
  termsAndConditions: string;
  companyName: string;
  companyAddress: string;
  companyGstin: string;
  supportEmail: string;
  supportPhone: string;
}

