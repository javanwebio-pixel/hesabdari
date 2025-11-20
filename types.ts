
import type { ReactNode, ReactElement } from 'react';

export interface NavItemType {
  label: string;
  icon?: ReactNode;
  path?: string;
  children?: NavItemType[];
}

export interface StatCardData {
  title: string;
  value: string;
  change?: number;
  icon: ReactElement<{ className?: string }>;
  color: 'green' | 'red' | 'orange' | 'blue' | 'purple';
}

export type TransactionStatus = 'موفق' | 'در انتظار' | 'لغو شده';
export type TransactionType = 'دریافت' | 'پرداخت';

export interface TransactionData {
  id: string;
  description: string;
  date: string;
  amount: number;
  status: TransactionStatus;
  type: TransactionType;
}

export interface ExpenseCategoryData {
    name: string;
    value: number;
}

// Financial Accounting Types
export type JournalEntryStatus = 'پیش‌نویس' | 'تایید شده' | 'ثبت شده' | 'باطل شده';

export interface JournalEntryLine {
  id: string;
  accountCode: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
  // Advanced Accounting Dimensions
  tafsiliId?: string;      // Detail Account Level 1 (e.g., Customer, Supplier)
  tafsiliName?: string;
  costCenterId?: string;   // Cost Center
  projectId?: string;      // Project
  currency?: string;       // Multi-currency support
  exchangeRate?: number;
  foreignAmount?: number;
}

export interface JournalEntry {
  id: string;
  serialNumber: number;   // System generated sequence
  docNumber: number;      // User definable or daily sequence
  referenceNumber?: string; // External reference (e.g., Invoice No)
  date: string;
  description: string;
  status: JournalEntryStatus;
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  sourceModule?: 'GL' | 'Recurring' | 'Closing' | 'AP' | 'AR' | 'Costing' | 'Assets' | 'POS' | 'Inventory' | 'Treasury' | 'Manufacturing' | 'PS';
  isReversing?: boolean;
  createdBy?: string;
  createdAt?: string;
}

export interface JournalEntryTemplate {
    id: string;
    name: string;
    description: string;
    lines: Omit<JournalEntryLine, 'id'>[];
}

export interface RecurringEntry {
    id: string;
    name: string;
    frequency: 'ماهانه' | 'سالانه' | 'هفتگی';
    status: 'فعال' | 'غیرفعال';
    startDate: string; // ISO format
    endDate?: string; // ISO format
    lastRunDate?: string;
    nextDueDate: string;
    lines: Omit<JournalEntryLine, 'id'>[];
}

export interface FiscalYearStatus {
    year: number;
    status: 'باز' | 'در حال بستن' | 'بسته';
    closingStep: number; // 0: not started, 1: pre-checks done, 2: entries generated, 3: finalized
    generatedClosingEntry?: Omit<JournalEntry, 'id' | 'serialNumber' | 'status'>;
    generatedOpeningEntry?: Omit<JournalEntry, 'id' | 'serialNumber' | 'status'>;
}

export interface ConvertibleDocument {
  id: string;
  docNumber: number;
  date: string;
  type: 'پیش‌فاکتور' | 'رسید انبار';
  partyName: string;
  amount: number;
}

export interface AccountNode {
  code: string;
  name: string;
  type: 'group' | 'account';
  children?: AccountNode[];
  linkedTafsiliGroups?: string[]; // Array of Tafsili Group IDs
}

// Setup Types
export interface TaxRate {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD
  vatRate: number; // in percent
  dutiesRate: number; // in percent
}

export interface Currency {
  id: string;
  code: string; // e.g., USD
  name: string; // e.g., دلار آمریکا
}

export interface ExchangeRate {
  id: string;
  currencyId: string;
  date: string; // YYYY-MM-DD
  rate: number;
}

export interface TafsiliGroup {
  id: string;
  name: string;
}

export interface TafsiliAccount {
  id: string;
  groupId: string;
  code: string;
  name: string;
  linkedGLAccounts: string[]; // Array of GL account codes
}


// Cost Accounting Types
export type CostCenterType = 'group' | 'Cost Center' | 'Profit Center' | 'Service Center';

export interface CostCenterNode {
    code: string;
    name: string;
    type: CostCenterType;
    children?: CostCenterNode[];
}

export type InternalOrderStatus = 'ایجاد شده' | 'آزاد شده' | 'تسویه شده' | 'بسته شده';
export type InternalOrderType = 'سرمایه‌گذاری' | 'تحقیق و توسعه' | 'بازاریابی' | 'نگهداری و تعمیرات' | 'عمومی';

export interface InternalOrder {
  id: string;
  orderNumber: number;
  description: string;
  status: InternalOrderStatus;
  orderType: InternalOrderType;
  responsiblePerson: string;
  plannedCosts: number;
  actualCosts: number;
}

// Standard Costing Types
export interface StandardCost {
    goodId: string;
    materialStdPrice: number;
    materialStdQty: number; // per unit of product
    laborStdRate: number;
    laborStdHours: number; // per unit of product
    overheadStdRate: number; // per labor hour
}

export interface ActualProductionData {
    goodId: string;
    producedQty: number;
    actualMaterialPrice: number;
    actualMaterialQty: number; // total used for production
    actualLaborRate: number;
    actualLaborHours: number; // total hours for production
    actualOverhead: number;
}

// Activity-Based Costing Types
export interface Activity {
    id: string;
    name: string;
    costPool: number;
    costDriverName: string;
    costDriverVolume: number;
}

// Budgeting Types
export interface BudgetLine {
    dimensionCode: string; // Can be Account Code or Cost Center Code
    monthlyAmounts: number[]; // Array of 12 numbers for each month
}

export interface Budget {
    id: string;
    fiscalYear: number;
    version: string; // e.g., 'اصلی', 'بازنگری اول'
    dimension: 'account' | 'costCenter';
    lines: BudgetLine[];
}


// Treasury Types
export type TreasuryDocType = 'دریافت' | 'پرداخت';
export type PaymentMethod = 'نقد' | 'چک' | 'حواله' | 'کارتخوان';
export type CheckStatus = 'در جریان وصول' | 'پاس شده' | 'برگشتی' | 'خرج شده' | 'باطل شده';
export type TreasuryDocStatus = 'نهایی' | 'باطل شده';

export interface TreasuryDoc {
    id: string;
    docNumber: number;
    date: string;
    partyId: string;
    partyName: string;
    amount: number;
    paymentMethod: PaymentMethod;
    description: string;
    type: TreasuryDocType;
    status: TreasuryDocStatus;
    // Optional fields for specific payment methods
    checkNumber?: string;
    checkDueDate?: string;
    bankName?: string;
    transactionId?: string;
    bankAccountId?: string;
    cashDeskId?: string;
    isCleared?: boolean;
    journalEntryId?: string;
}

export interface CheckHistory {
    status: CheckStatus;
    date: string;
    user: string;
}

export interface Check {
    id: string;
    checkNumber: string;
    dueDate: string;
    dueDateObj: Date;
    type: 'دریافتی' | 'پرداختی';
    partyName: string;
    amount: number;
    bankName: string;
    status: CheckStatus;
    history?: CheckHistory[];
    bankAccountId?: string;
    isCleared?: boolean;
}

export interface Bank {
    id: string;
    code: string;
    name: string;
}

export interface BankAccount {
    id: string;
    bankName: string;
    branchName: string;
    accountNumber: string;
    iban: string;
    accountType: 'جاری' | 'پس‌انداز';
    currency: 'ریال' | 'دلار' | 'یورو';
    isActive: boolean;
    balance: number;
}

export interface BankStatementTransaction {
    id: string;
    date: string;
    description: string;
    debit: number;
    credit: number;
    isCleared?: boolean;
}

export interface CashDesk {
    id: string;
    name: string;
    balance: number;
}

// Warehouse Types
export interface Good {
  id: string;
  code: string;
  name: string;
  unit: 'عدد' | 'کیلوگرم' | 'متر' | 'بسته';
  stock: number;
  purchasePrice: number;
  salePrice: number;
  category: string;
  inventoryAccountCode: string;
  cogsAccountCode: string;
  type?: 'Finished Good' | 'Raw Material' | 'Semi-Finished';
}

export interface InventoryMovement {
  id: string;
  date: string;
  goodId: string;
  goodName: string;
  quantity: number; // positive for IN, negative for OUT
  type: 'ورود' | 'خروج';
  referenceDocId: string; 
  referenceDocNumber: string;
}


// Sales Types
export type InvoiceStatus = 'پیش‌نویس' | 'ثبت نهایی' | 'ارسال شده' | 'پرداخت قسمتی' | 'پرداخت شده' | 'لغو شده' | 'معوق';


export interface Party {
  id: string;
  code: string;
  name: string;
  type: 'حقیقی' | 'حقوقی';
  nationalId: string; // or registration number
  phone: string;
  address: string;
}

export interface InvoiceLine {
  id: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  rate: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  issueDate: string;
  dueDate: string;
  dueDateObj: Date;
  lines: InvoiceLine[];
  notes: string;
  subtotal: number;
  tax: number; // as a fixed amount
  discount: number; // as a fixed amount
  total: number;
  paidAmount: number;
  status: InvoiceStatus;
  journalEntryId?: string;
}

// --- NEW SALES TYPES ---
export type QuoteStatus = 'پیش‌نویس' | 'ارسال شده' | 'پذیرفته شده' | 'رد شده' | 'منقضی شده';
export type SalesOrderStatus = 'باز' | 'در حال پردازش' | 'ارسال شده' | 'لغو شده';
export type DeliveryNoteStatus = 'در حال آماده‌سازی' | 'ارسال شده' | 'تحویل شده';
export type SalesContractStatus = 'فعال' | 'خاتمه یافته';

export type QuoteLine = InvoiceLine;

export interface Quote {
    id: string;
    quoteNumber: string;
    customerId: string;
    customerName: string;
    issueDate: string;
    validityDate: string;
    lines: QuoteLine[];
    total: number;
    status: QuoteStatus;
}

export type SalesOrderLine = InvoiceLine;

export interface SalesOrder {
    id: string;
    orderNumber: string;
    quoteId?: string;
    customerId: string;
    customerName: string;
    orderDate: string;
    requiredDeliveryDate: string;
    lines: SalesOrderLine[];
    total: number;
    status: SalesOrderStatus;
}

export interface DeliveryNoteLine {
    id: string;
    goodId: string;
    goodName: string;
    quantityOrdered: number;
    quantityShipped: number;
}

export interface DeliveryNote {
    id: string;
    deliveryNumber: string;
    orderId: string;
    deliveryDate: string;
    lines: DeliveryNoteLine[];
    status: DeliveryNoteStatus;
    journalEntryId?: string;
}

export interface SalesContract {
    id: string;
    contractNumber: string;
    customerId: string;
    customerName: string;
    startDate: string;
    endDate: string;
    totalValue: number;
    status: SalesContractStatus;
}
// --- END NEW SALES TYPES ---

// --- PRICING TYPES (REVISED) ---
export interface PriceListItem {
    id: string;
    goodId: string;
    goodName: string;
    price: number;
}

export interface PriceList {
    id: string;
    name: string;
    currency: 'ریال' | 'USD';
    validFrom: string; // YYYY-MM-DD
    validTo: string | null; // YYYY-MM-DD
    items: PriceListItem[];
}

export type DiscountConditionTarget = 'CATEGORY' | 'PRODUCT' | 'CUSTOMER' | 'ORDER_TOTAL';
export type DiscountActionType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'VOLUME';

export interface DiscountRule {
    id: string;
    name: string;
    isActive: boolean;
    validFrom: string | null;
    validTo: string | null;
    priority: number; // Lower number = higher priority
    conditions: {
        target: DiscountConditionTarget;
        operator: 'EQ'; // For now, only equals
        value: string; // e.g., 'دیجیتال', a product ID, or a customer ID
    }[];
    action: {
        type: DiscountActionType;
        value?: number; // For percentage or fixed amount
        tiers?: { minQty: number; discountPercent: number }[]; // For volume
    };
}

// Pricing Procedure Types
export type PricingConditionClass = 'Price' | 'Discount' | 'Surcharge' | 'Tax';

export interface PricingProcedureStep {
    step: number;
    conditionCode: string; // e.g., 'PR00', 'K007', 'MWST'
    description: string;
    conditionClass: PricingConditionClass;
    calculationFormula: string; // e.g., 'Base Value', 'From Step 10', '% on Step 20'
}

export interface PricingProcedure {
    id: string;
    name: string;
    steps: PricingProcedureStep[];
}
// --- END PRICING TYPES (REVISED) ---


// --- CRM & SERVICE TYPES (ENHANCED) ---
export type OpportunityStage = 'ارزیابی' | 'ارسال پیشنهاد' | 'مذاکره' | 'موفق' | 'ناموفق';

export interface Opportunity {
    id: string;
    name: string;
    customerId: string;
    customerName: string;
    stage: OpportunityStage;
    value: number;
    probability: number; // 0-100
    expectedCloseDate: string;
    description?: string;
}

export type TicketStatus = 'جدید' | 'در حال بررسی' | 'در انتظار پاسخ مشتری' | 'حل شده' | 'بسته شده';
export type TicketPriority = 'کم' | 'متوسط' | 'زیاد' | 'فوری';

export interface TicketReply {
    id: string;
    author: string; // 'customer' or user name
    message: string;
    date: string;
}

export interface SupportTicket {
    id: string;
    ticketNumber: number;
    subject: string;
    description: string;
    customerId: string;
    customerName: string;
    createdDate: string;
    status: TicketStatus;
    priority: TicketPriority;
    assignedTo: string; // user name
    replies?: TicketReply[];
}

export type ServiceContractStatus = 'فعال' | 'در شرف انقضا' | 'منقضی شده';

export interface ServiceContract {
    id: string;
    contractNumber: string;
    customerId: string;
    customerName: string;
    startDate: string;
    endDate: string;
    serviceLevel: string; // e.g., 'طلایی', 'نقره‌ای'
    monthlyFee: number;
    status: ServiceContractStatus;
    description?: string;
}

export type FieldServiceStatus = 'زمان‌بندی شده' | 'اعزام شده' | 'در حال انجام' | 'تکمیل شده' | 'لغو شده';

export interface FieldServiceOrder {
    id: string;
    orderNumber: string;
    ticketId?: string; // Optional link to a support ticket
    customerId: string;
    customerName: string;
    address: string;
    serviceDescription: string;
    scheduledDate: string;
    technician: string;
    status: FieldServiceStatus;
    technicianNotes?: string;
}
// --- END CRM & SERVICE TYPES ---

// --- POINT OF SALE (POS) TYPES ---
export interface POSTerminal {
    id: string;
    name: string;
    location: string;
    defaultCashAccountId: string; // GL Account for cash
    defaultBankAccountId: string; // GL Account for card payments
    defaultSalesAccountId: string; // GL Account for sales revenue
}

export interface POSTransaction {
    id: string;
    terminalId: string;
    date: string;
    total: number;
    paymentMethod: 'نقد' | 'کارتخوان';
}

export interface POSCloseout {
    id: string;
    terminalId: string;
    terminalName: string;
    closeDate: string;
    totalSales: number;
    expectedCash: number;
    actualCash: number;
    cashDifference: number;
    cardTotal: number;
    journalEntryId: string;
}
// --- END POS TYPES ---


// Accounts Receivable Types
export interface CustomerReceipt {
    id: string;
    receiptNumber: number;
    customerId: string;
    customerName: string;
    paymentDate: string;
    amount: number;
    paymentMethod: PaymentMethod;
    bankName?: string;
    notes?: string;
    appliedInvoices: { invoiceId: string; amount: number }[];
}


// Accounts Payable Types
export type SupplierInvoiceStatus = 'پیش‌نویس' | 'ثبت شده' | 'پرداخت قسمتی' | 'پرداخت شده' | 'لغو شده';

export interface SupplierInvoiceLine {
  id: string;
  itemCode: string; // Could be Good's code or an expense account code
  itemName: string;
  description?: string;
  quantity: number;
  rate: number;
  total: number;
}

export interface SupplierInvoice {
  id: string;
  invoiceNumber: string; // Supplier's invoice number
  supplierId: string; // Link to Party
  supplierName: string;
  invoiceDate: string;
  dueDate: string;
  dueDateObj: Date;
  lines: SupplierInvoiceLine[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  status: SupplierInvoiceStatus;
  notes?: string;
  daysOverdue?: number; // Calculated field for UI
  purchaseOrderId?: string; // Link to PO for 3-way match
}

export interface SupplierPayment {
    id: string;
    paymentNumber: number;
    supplierId: string;
    supplierName: string;
    paymentDate: string;
    amount: number;
    paymentMethod: PaymentMethod;
    bankName?: string;
    notes?: string;
    appliedInvoices: { invoiceId: string; amount: number }[];
}

// --- PROCUREMENT & INVENTORY (MM) TYPES ---
export type PurchaseRequestStatus = 'پیش‌نویس' | 'در انتظار تایید' | 'تایید شده' | 'رد شده' | 'سفارش داده شده';
export interface PurchaseRequestLine {
  id: string;
  goodId: string;
  goodName: string;
  quantity: number;
  requiredDate: string;
}
export interface PurchaseRequest {
  id: string;
  requestNumber: number;
  requester: string;
  requestDate: string;
  status: PurchaseRequestStatus;
  lines: PurchaseRequestLine[];
  projectId?: string;
}

export type PurchaseOrderStatus = 'باز' | 'دریافت قسمتی' | 'دریافت کامل' | 'فاکتور شده' | 'بسته';
export interface PurchaseOrderLine {
  id: string;
  goodId: string;
  goodName: string;
  quantity: number;
  price: number;
  total: number;
}
export interface PurchaseOrder {
  id: string;
  poNumber: number;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  deliveryDate: string;
  totalAmount: number;
  status: PurchaseOrderStatus;
  lines: PurchaseOrderLine[];
  purchaseRequestId?: string;
  projectId?: string;
}

export interface GoodsReceiptLine {
    id: string;
    goodId: string;
    goodName: string;
    quantityOrdered: number;
    quantityReceived: number;
}
export interface GoodsReceipt {
    id: string;
    receiptNumber: number;
    purchaseOrderId: string;
    receiptDate: string;
    lines: GoodsReceiptLine[];
}

export type StocktakeStatus = 'شمارش نشده' | 'در حال شمارش' | 'شمارش شده' | 'ثبت شده';
export interface StocktakeLine {
    id: string;
    goodId: string;
    goodName: string;
    bookQuantity: number;
    countedQuantity: number | null;
}
export interface Stocktake {
    id: string;
    documentNumber: number;
    countDate: string;
    status: StocktakeStatus;
    lines: StocktakeLine[];
    journalEntryId?: string;
}
// --- END MM TYPES ---

// Asset Management Types
export interface AssetClass {
    id: string;
    name: string;
    depreciationMethod: 'Straight-line';
    usefulLife: number; // in years
}

export interface FixedAsset {
    id: string;
    code: string;
    description: string;
    assetClassId: string;
    acquisitionDate: string; // YYYY-MM-DD for easier calculations
    acquisitionCost: number;
    salvageValue: number;
    status: 'Active' | 'Sold' | 'Scrapped';
    // Calculated fields
    accumulatedDepreciation?: number;
    bookValue?: number;
}

export type AssetTransactionType = 'Acquisition' | 'Sale' | 'Disposal';

export interface AssetTransaction {
    id: string;
    assetId: string;
    assetDescription: string;
    type: AssetTransactionType;
    date: string; // fa-IR date
    amount?: number; // for sale or acquisition cost
}

// Plant Maintenance Types
export interface MaintenanceObject {
    id: string;
    name: string;
    location: string;
    type: 'Equipment' | 'Machine';
}

export interface MaintenanceOrder {
    id: string;
    orderNumber: number;
    objectId: string;
    objectName: string;
    description: string;
    type: 'Corrective' | 'Preventive';
    status: 'Open' | 'In Progress' | 'Completed';
    creationDate: string; // fa-IR date
}

export interface PreventivePlan {
    id: string;
    planName: string;
    objectId: string;
    objectName: string;
    taskDescription: string;
    frequency: number; // in days
    lastRun?: string; // fa-IR date
    nextRun: string; // fa-IR date
}


// --- NEW MM/WAREHOUSE TYPES ---
export interface RFQLine {
  id: string;
  goodId: string;
  goodName: string;
  quantity: number;
}
export interface SupplierQuote {
  supplierId: string;
  supplierName: string;
  price: number;
  deliveryDays: number;
  notes?: string;
}
export interface RFQ {
  id: string;
  rfqNumber: number;
  creationDate: string;
  closingDate: string;
  status: 'پیش‌نویس' | 'ارسال شده' | 'بسته شده';
  lines: RFQLine[];
  quotes: SupplierQuote[];
  purchaseRequestId?: string;
}

export interface PurchaseContract {
  id: string;
  contractNumber: string;
  supplierId: string;
  supplierName: string;
  startDate: string;
  endDate: string;
  targetValue: number;
  releasedValue: number;
  status: 'فعال' | 'منقضی شده';
}

export interface Batch {
  id: string;
  batchNumber: string;
  goodId: string;
  goodName: string;
  manufactureDate: string;
  expiryDate?: string;
  quantity: number;
  location: string; 
}

export interface SerialNumber {
  id: string;
  serialNumber: string;
  goodId: string;
  goodName: string;
  status: 'موجود' | 'در استفاده' | 'اسقاط';
  location: string;
}

export interface InspectionLot {
  id: string;
  lotNumber: number;
  goodId: string;
  goodName: string;
  quantity: number;
  creationDate: string;
  status: 'باز' | 'تصمیم‌گیری شده';
  usageDecision?: 'پذیرفته شده' | 'رد شده';
  goodsReceiptId: string;
}

export interface StorageBin {
  id: string;
  code: string; // e.g., A-01-01
  aisle: string;
  rack: string;
  level: string;
  goodId?: string; // For fixed bin
  capacity?: number;
}
export interface WarehouseStructureNode {
  id: string;
  name: string;
  type: 'انبار' | 'محل نگهداری' | 'راهرو' | 'قفسه';
  children: WarehouseStructureNode[];
}

export interface PickingStrategy {
  id: string;
  name: string;
  rule: 'FIFO' | 'LIFO';
}

export interface PutawayStrategy {
  id: string;
  name: string;
  rule: 'اولین خالی' | 'جایگاه ثابت';
}
// --- END NEW MM/WAREHOUSE TYPES ---

// --- PRODUCTION PLANNING (PP) TYPES ---
export interface BOMItem {
    id: string;
    componentId: string; // Good ID of the component
    componentName: string;
    quantity: number;
}
export interface BOM {
    id: string;
    goodId: string; // Good ID of the finished product
    goodName: string;
    items: BOMItem[];
}

export interface WorkCenter {
    id: string;
    code: string;
    name: string;
    capacity: number; // e.g., hours per day
}

export interface RoutingOperation {
    id: string;
    operationNumber: number; // 10, 20, 30...
    description: string;
    workCenterId: string;
    setupTime: number; // in minutes
    runTime: number; // in minutes per unit
}
export interface Routing {
    id: string;
    goodId: string; // Good ID of the product
    goodName: string;
    operations: RoutingOperation[];
}

export type ProductionOrderStatus = 'ایجاد شده' | 'برنامه‌ریزی شده' | 'آزاد شده' | 'در حال تولید' | 'تایید شده' | 'بسته شده';
export interface ProductionOrder {
    id: string;
    orderNumber: number;
    goodId: string;
    goodName: string;
    quantity: number;
    startDate: string;
    endDate: string;
    status: ProductionOrderStatus;
    bomId: string;
    routingId: string;
    actualCosts?: { material: number, labor: number, overhead: number };
    standardCosts?: { material: number, labor: number, overhead: number };
}

export interface MRPDemand {
    goodId: string;
    quantity: number;
    dueDate: string;
}
export interface MRPResult {
    type: 'Purchase Requisition' | 'Production Order';
    goodId: string;
    goodName: string;
    quantity: number;
    requiredDate: string;
}
// --- END PP TYPES ---

// --- PROJECT SYSTEM (PS) TYPES ---
export type ProjectStatus = 'تعریف شده' | 'در حال اجرا' | 'متوقف' | 'خاتمه یافته' | 'لغو شده';
export type WBSStatus = 'باز' | 'آزاد شده' | 'تکمیل شده';
export type ActivityStatus = 'باز' | 'در حال انجام' | 'تایید شده' | 'بسته';

export interface ProjectDefinition {
    id: string;
    projectCode: string;
    description: string;
    customerName: string;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    status: ProjectStatus;
    budget: number;
    actualCost: number;
}

export interface WBSNode {
    id: string;
    projectId: string;
    code: string; // e.g., P-01.1, P-01.1.1
    description: string;
    status: WBSStatus;
    plannedCost: number;
    actualCost: number;
    parentId: string | null;
    children?: WBSNode[];
}

export interface ActivityDependency {
    activityId: string;
    type: 'FS' | 'SS' | 'FF' | 'SF'; // Finish-to-Start, etc.
}

export interface NetworkActivity {
    id: string;
    wbsId: string;
    activityNumber: string; // e.g., 10, 20
    description: string;
    duration: number; // in days
    workCenter?: string;
    dependencies: ActivityDependency[];
    status: ActivityStatus;
    plannedStartDate?: string;
    plannedEndDate?: string;
}

export interface ProjectResource {
    id: string;
    activityId: string;
    resourceName: string; // Could be user ID or just name
    plannedHours: number;
    actualHours: number;
}

export interface TimesheetEntry {
    id: string;
    userId: string;
    userName: string;
    wbsId: string;
    activityId?: string;
    workDate: string; // YYYY-MM-DD
    hours: number;
    description: string;
    status: 'پیش‌نویس' | 'تایید شده' | 'رد شده';
}

export interface ProjectBillingMilestone {
    id: string;
    projectId: string;
    description: string;
    dueDate: string;
    amount: number;
    status: 'برنامه‌ریزی شده' | 'صورت وضعیت شده' | 'پرداخت شده';
}


// --- System Administration Types ---
export interface Role {
    id: string;
    name: string;
}

export interface User {
    id: string;
    username: string;
    fullName: string;
    roleId: string;
    status: 'فعال' | 'غیرفعال';
    avatarUrl: string;
}

export interface CompanyInfo {
    name: string;
    legalName: string;
    nationalId: string;
    registrationNumber: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    logoUrl: string;
}


// UI Types
export interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// --- Report Builder Types ---
export interface PivotField {
  id: string; // e.g., 'sales.customer'
  name: string; // e.g., 'مشتری'
  type: 'dimension' | 'measure';
}

export interface DataSource {
  id: string;
  name: string;
  fields: PivotField[];
}

export interface PivotConfig {
  rows: PivotField[];
  columns: PivotField[];
  values: PivotField[];
}


// --- Human Capital Management (HCM) Types ---
export interface Employee {
    id: string;
    employeeId: string;
    fullName: string;
    position: string;
    department: string;
    hireDate: string;
    status: 'فعال' | 'غیرفعال';
    avatarUrl: string;
    email: string;
    phone: string;
}

export interface OrgUnit {
    id: string;
    name: string;
    manager?: string;
    headcount: number;
    children?: OrgUnit[];
}

export interface Payslip {
    id: string;
    employeeId: string;
    period: string; // e.g., 'مرداد ۱۴۰۳'
    grossSalary: number;
    deductions: number;
    netSalary: number;
}

export interface AttendanceRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    date: string;
    checkIn: string;
    checkOut: string;
    status: 'حاضر' | 'غیبت' | 'مرخصی';
}

export interface JobOpening {
    id: string;
    title: string;
    department: string;
    status: 'باز' | 'بسته';
}

export interface Candidate {
    id: string;
    jobId: string;
    name: string;
    stage: 'رزومه دریافتی' | 'مصاحبه اولیه' | 'مصاحبه فنی' | 'پیشنهاد' | 'استخدام شده';
    avatarUrl: string;
}

export interface PerformanceReview {
    id: string;
    employeeId: string;
    employeeName: string;
    reviewDate: string;
    rating: number; // 1-5
    reviewer: string;
}

export interface TrainingCourse {
    id: string;
    title: string;
    instructor: string;
    duration: string; // e.g., '8 ساعت'
    enrolled: number;
}


// BI Types
export type BIWidgetComponentType = 'KPIWidget' | 'SalesOverTimeWidget' | 'TopCustomersWidget' | 'AccountsReceivableAgingWidget';

export interface BIWidget {
    id: string;
    component: BIWidgetComponentType;
    title: string;
    gridColumn: string;
    gridRow: string;
    props?: { [key: string]: any }; // For specific configurations, e.g., which metric a KPI should show
}
