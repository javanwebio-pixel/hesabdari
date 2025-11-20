


import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Sidebar, navGroups } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { JournalEntriesListPage } from './components/financial-accounting/JournalEntriesListPage';
import { NewJournalEntryPage } from './components/financial-accounting/NewJournalEntryPage';
import { ConvertDocumentsPage } from './components/financial-accounting/ConvertDocumentsPage';
import { RecurringEntriesPage } from './components/financial-accounting/gl/RecurringEntriesPage';
import { YearEndClosingPage } from './components/financial-accounting/gl/YearEndClosingPage';
import { JournalEntryTemplatesPage } from './components/financial-accounting/gl/JournalEntryTemplatesPage';
import { NewReceiptPage } from './components/treasury/NewReceiptPage';
import { NewPaymentPage } from './components/treasury/NewPaymentPage';
import { BankOperationsPage } from './components/treasury/BankOperationsPage';
import { NewCheckPage } from './components/treasury/NewCheckPage';
import { TreasuryListPage as TreasuryDashboardPage } from './components/treasury/TreasuryListPage';
import { CashFlowForecastPage } from './components/treasury/CashFlowForecastPage';
import { BankReconciliationPage } from './components/treasury/BankReconciliationPage';
import { NewInvoicePage } from './components/sales/NewInvoicePage';
import { ToastContainer } from './components/common/Toast';
import { SupplierInvoicesListPage } from './components/financial-accounting/ap/SupplierInvoicesListPage';
import { SupplierPaymentsPage } from './components/financial-accounting/ap/SupplierPaymentsPage';
import { AgingReportPage as APRAgingReportPage } from './components/financial-accounting/ap/AgingReportPage';
import { CustomerInvoicesListPage } from './components/financial-accounting/ar/CustomerInvoicesListPage';
import { CustomerReceiptsPage } from './components/financial-accounting/ar/CustomerReceiptsPage';
import { DunningReportPage } from './components/financial-accounting/ar/DunningReportPage';
import { CostAllocationPage } from './components/financial-accounting/cost/CostAllocationPage';
import { CostCenterReportPage } from './components/financial-accounting/cost/CostCenterReportPage';
import { StandardCostingPage } from './components/financial-accounting/cost/StandardCostingPage';
import { ActivityBasedCostingPage } from './components/financial-accounting/cost/ActivityBasedCostingPage';
import { InternalOrdersPage } from './components/financial-accounting/cost/InternalOrdersPage';
import { DefineBudgetPage } from './components/financial-accounting/budget/DefineBudgetPage';
import { BudgetActualsReportPage } from './components/financial-accounting/budget/BudgetActualsReportPage';
import { StandardReportsPage } from './components/financial-accounting/reports/StandardReportsPage';
import { FinancialStatementsPage } from './components/financial-accounting/reports/FinancialStatementsPage';
import { AssetMasterPage } from './components/asset-management/AssetMasterPage';
import { DepreciationRunPage } from './components/asset-management/DepreciationRunPage';
import { AssetTransactionsPage } from './components/asset-management/AssetTransactionsPage';
import { MaintenanceObjectsPage } from './components/asset-management/pm/MaintenanceObjectsPage';
import { MaintenanceOrdersPage } from './components/asset-management/pm/MaintenanceOrdersPage';
import { PreventiveMaintenancePage } from './components/asset-management/pm/PreventiveMaintenancePage';
import { ConsolidationPage } from './components/financial-accounting/reports/ConsolidationPage';
import { ReportBuilderPage } from './components/financial-accounting/reports/ReportBuilderPage';
import { TaxSettingsPage } from './components/financial-accounting/setup/TaxSettingsPage';
import { CurrencySettingsPage } from './components/financial-accounting/setup/CurrencySettingsPage';
import { NewQuotePage } from './components/sales/NewQuotePage';
import { NewOrderPage } from './components/sales/NewOrderPage';
import { NewDeliveryPage } from './components/sales/NewDeliveryPage';
import { SalesContractsPage } from './components/sales/SalesContractsPage';
import { OpportunitiesPage } from './components/sales/crm/OpportunitiesPage';
import { SupportTicketsPage } from './components/sales/crm/SupportTicketsPage';
import { ServiceContractsListPage } from './components/sales/crm/ServiceContractsListPage';
import { FieldServicePage } from './components/sales/crm/FieldServicePage';
import { POSTerminalsPage } from './components/sales/pos/POSTerminalsPage';
import { POSClosingPage } from './components/sales/pos/POSClosingPage';
import { PriceListsPage } from './components/sales/pricing/PriceListsPage';
import { DiscountsPage } from './components/sales/pricing/DiscountsPage';
import { PricingProcedurePage } from './components/sales/pricing/PricingProcedurePage';
import { PriceAnalysisPage } from './components/sales/pricing/PriceAnalysisPage';
import { InventoryMovementsPage } from './components/inventory/InventoryMovementsPage';
import { SalesAnalyticsDashboardPage } from './components/sales/analytics/SalesAnalyticsDashboardPage';
import { ProcurementAnalyticsDashboardPage } from './components/procurement/analytics/ProcurementAnalyticsDashboardPage';
import { PurchaseRequestPage } from './components/procurement/PurchaseRequestPage';
import { PurchaseOrderPage } from './components/procurement/PurchaseOrderPage';
import { GoodsReceiptPage } from './components/procurement/GoodsReceiptPage';
import { InventoryStocktakingPage } from './components/inventory/InventoryStocktakingPage';
import { RFQPage } from './components/procurement/RFQPage';
import { InvoiceVerificationPage } from './components/procurement/InvoiceVerificationPage';
import { PurchaseContractsPage } from './components/procurement/PurchaseContractsPage';
import { BatchSerialTraceabilityPage } from './components/inventory/BatchSerialTraceabilityPage';
import { QualityControlPage } from './components/inventory/QualityControlPage';
import { WarehouseStructurePage } from './components/warehouse/WarehouseStructurePage';
import { WarehouseStrategyPage } from './components/warehouse/WarehouseStrategyPage';
import { BarcodePrintingPage } from './components/warehouse/BarcodePrintingPage';
import { BOMPage } from './components/manufacturing/BOMPage';
import { WorkCenterPage } from './components/manufacturing/WorkCenterPage';
import { ProductionOrdersPage } from './components/manufacturing/ProductionOrdersPage';
import { MRPPage } from './components/manufacturing/MRPPage';
import { ShopFloorControlPage } from './components/manufacturing/ShopFloorControlPage';
import { ProductCostingPage } from './components/manufacturing/ProductCostingPage';
import { ProductionVariancePage } from './components/manufacturing/ProductionVariancePage';
import { ProjectDashboardPage } from './components/ps/ProjectReportsPage';
import { WBSPage } from './components/ps/WBSPage';
import { NetworkPage } from './components/ps/NetworkPage';
import { CostPlanningPage } from './components/ps/CostPlanningPage';
import { ResourcePlanningPage } from './components/ps/ResourcePlanningPage';
import { SchedulePage } from './components/ps/SchedulePage';
import { TimesheetPage } from './components/ps/TimesheetPage';
import { ProjectProcurementPage } from './components/ps/ProjectProcurementPage';
import { ProjectBillingPage } from './components/ps/ProjectBillingPage';
import { UsersPage } from './components/admin/UsersPage';
import { CompanyInfoPage } from './components/admin/CompanyInfoPage';
import { BIDashboardsPage } from './components/bi/BIDashboardsPage';

// Centralized Master Data Pages
import { AccountsPage as MasterDataAccountsPage } from './components/master-data/AccountsPage';
import { PartiesPage as MasterDataPartiesPage } from './components/master-data/PartiesPage';
import { GoodsPage as MasterDataGoodsPage } from './components/master-data/GoodsPage';
import { CostCentersPage as MasterDataCostCentersPage } from './components/master-data/CostCentersPage';
import { DetailedAccountsPage as MasterDataDetailedAccountsPage } from './components/master-data/DetailedAccountsPage';
import { BanksPage as MasterDataBanksPage } from './components/master-data/BanksPage';
import { BankAccountsPage as MasterDataBankAccountsPage } from './components/master-data/BankAccountsPage';
import { CashDeskPage as MasterDataCashDeskPage } from './components/master-data/CashDeskPage';
import { AssetClassesPage as MasterDataAssetClassesPage } from './components/master-data/AssetClassesPage';

// HCM Pages
import { EmployeeMasterPage } from './components/hcm/admin/EmployeeMasterPage';
import { OrgStructurePage } from './components/hcm/admin/OrgStructurePage';
import { PayrollCalculationPage } from './components/hcm/payroll/PayrollCalculationPage';
import { PayrollReportsPage } from './components/hcm/payroll/PayrollReportsPage';
import { AttendancePage } from './components/hcm/time/AttendancePage';
import { RecruitmentPage } from './components/hcm/talent/RecruitmentPage';
import { PerformancePage } from './components/hcm/talent/PerformancePage';
import { LearningPage } from './components/hcm/talent/LearningPage';
import { EmployeePortalPage } from './components/hcm/ess/EmployeePortalPage';


import type { JournalEntry, Check, TreasuryDoc, ToastData, AccountNode, Invoice, Good, Party, SupplierInvoice, SupplierPayment, RecurringEntry, FiscalYearStatus, JournalEntryTemplate, CustomerReceipt, CostCenterNode, StandardCost, ActualProductionData, Activity, InternalOrder, Budget, FixedAsset, AssetClass, TaxRate, Currency, ExchangeRate, TafsiliGroup, TafsiliAccount, CheckHistory, CheckStatus, Bank, BankAccount, BankStatementTransaction, CashDesk, Quote, SalesOrder, DeliveryNote, SalesContract, Opportunity, SupportTicket, TicketReply, ServiceContract, FieldServiceOrder, POSTerminal, POSTransaction, POSCloseout, PriceList, DiscountRule, PricingProcedure, InventoryMovement, PurchaseRequest, PurchaseRequestStatus, PurchaseOrder, GoodsReceipt, Stocktake, RFQ, PurchaseContract, Batch, SerialNumber, InspectionLot, WarehouseStructureNode, PutawayStrategy, PickingStrategy, BOM, WorkCenter, Routing, ProductionOrder, MRPDemand, MRPResult, BOMItem, RoutingOperation, ProjectDefinition, WBSNode, NetworkActivity, TimesheetEntry, ProjectBillingMilestone, Role, User, CompanyInfo, Employee, OrgUnit, Payslip, AttendanceRecord, JobOpening, Candidate, PerformanceReview, TrainingCourse, AssetTransaction, MaintenanceObject, MaintenanceOrder, PreventivePlan, BIWidget } from './types';
import { v4 as uuidv4 } from 'uuid';

// --- MOCK DATA ---
const today = new Date();
const formatDate = (date: Date) => date.toLocaleDateString('fa-IR-u-nu-latn', { year: 'numeric', month: '2-digit', day: '2-digit' });
const formatDateISO = (date: Date) => date.toISOString().split('T')[0];
const daysAgo = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
};

const mockJournalEntries: JournalEntry[] = [
    { id: '1', serialNumber: 1001, docNumber: 101, date: formatDate(daysAgo(-30)), description: 'ثبت هزینه‌های حقوق و دستمزد مرداد ماه', status: 'ثبت شده', lines: [
        { id: 'l1-1', accountCode: '5201', accountName: 'هزینه حقوق و دستمزد', description: 'حقوق مرداد', debit: 150000000, credit: 0 },
        { id: 'l1-2', accountCode: '1101', accountName: 'موجودی نقد و بانک', description: 'پرداخت حقوق مرداد', debit: 0, credit: 150000000 },
    ], totalDebit: 150000000, totalCredit: 150000000, sourceModule: 'GL' },
    { id: '2', serialNumber: 1002, docNumber: 102, date: formatDate(daysAgo(-29)), description: 'خرید اثاثه اداری و پرداخت از بانک', status: 'تایید شده', lines: [
        { id: 'l2-1', accountCode: '1201', accountName: 'دارایی‌های ثابت مشهود', description: 'خرید میز', debit: 25000000, credit: 0 },
        { id: 'l2-2', accountCode: '1101', accountName: 'موجودی نقد و بانک', description: 'پرداخت وجه میز', debit: 0, credit: 25000000 },
    ], totalDebit: 25000000, totalCredit: 25000000, sourceModule: 'AP' },
    { id: '3', serialNumber: 1003, docNumber: 103, date: formatDate(daysAgo(-28)), description: 'پرداخت قبض اینترنت شرکت', status: 'پیش‌نویس', lines: [], totalDebit: 1800000, totalCredit: 1800000, sourceModule: 'GL' },
    { id: '4', serialNumber: 1004, docNumber: 104, date: formatDate(daysAgo(-65)), description: 'هزینه اجاره تیر ماه', status: 'ثبت شده', lines: [
        { id: 'l4-1', accountCode: '5202', accountName: 'هزینه اجاره', description: 'اجاره تیر', debit: 50000000, credit: 0 },
        { id: 'l4-2', accountCode: '1101', accountName: 'موجودی نقد و بانک', description: 'پرداخت اجاره تیر', debit: 0, credit: 50000000 },
    ], totalDebit: 50000000, totalCredit: 50000000, sourceModule: 'GL' },
    { id: 'inv-j-1', serialNumber: 1005, docNumber: 105, date: formatDate(daysAgo(-50)), description: 'فروش به مشتری آلفا - فاکتور F-1403-101', status: 'ثبت شده', lines: [
        { id: 'inv-l1', accountCode: '1103', accountName: 'حساب‌ها و اسناد دریافتنی تجاری', description: 'مشتری آلفا', debit: 22000000, credit: 0, tafsiliId: 'ta1', tafsiliName: 'مشتری آلفا' },
        { id: 'inv-l2', accountCode: '4101', accountName: 'فروش', description: 'فروش کالا', debit: 0, credit: 22000000 },
    ], totalDebit: 22000000, totalCredit: 22000000, sourceModule: 'AR' },
];
const mockChecks: Check[] = [
    { id: 'c1', checkNumber: '112233', dueDate: formatDate(daysAgo(-10)), dueDateObj: daysAgo(-10), type: 'دریافتی', partyName: 'شرکت آلفا', amount: 15000000, bankName: 'ملت', status: 'پاس شده', bankAccountId: 'ba1', isCleared: true, history: [
        { status: 'در جریان وصول', date: formatDate(daysAgo(-15)), user: 'علی رضایی' },
        { status: 'پاس شده', date: formatDate(daysAgo(-10)), user: 'سارا احمدی' }
    ]},
    { id: 'c2', checkNumber: '445566', dueDate: formatDate(daysAgo(15)), dueDateObj: daysAgo(15), type: 'دریافتی', partyName: 'فروشگاه امیری', amount: 8250000, bankName: 'ملی', status: 'در جریان وصول', bankAccountId: 'ba2', isCleared: false, history: [
        { status: 'در جریان وصول', date: formatDate(daysAgo(2)), user: 'علی رضایی' }
    ]},
     { id: 'c3', checkNumber: '789012', dueDate: formatDate(daysAgo(-20)), dueDateObj: daysAgo(-20), type: 'پرداختی', partyName: 'تامین کننده بتا', amount: 10000000, bankName: 'صادرات', status: 'پاس شده', bankAccountId: 'ba3', isCleared: true, history: [
        { status: 'در جریان وصول', date: formatDate(daysAgo(-25)), user: 'علی رضایی' },
        { status: 'پاس شده', date: formatDate(daysAgo(-20)), user: 'مدیر سیستم' }
    ]},
    { id: 'c4', checkNumber: '345678', dueDate: formatDate(daysAgo(5)), dueDateObj: daysAgo(5), type: 'دریافتی', partyName: 'مشتری ویژه', amount: 5500000, bankName: 'تجارت', status: 'برگشتی', bankAccountId: 'ba1', isCleared: false, history: [
        { status: 'در جریان وصول', date: formatDate(daysAgo(10)), user: 'سارا احمدی' },
        { status: 'برگشتی', date: formatDate(daysAgo(5)), user: 'علی رضایی' }
    ]},
    { id: 'c5', checkNumber: '999888', dueDate: formatDate(daysAgo(-2)), dueDateObj: daysAgo(-2), type: 'پرداختی', partyName: 'تامین کننده گاما', amount: 7200000, bankName: 'ملت', status: 'در جریان وصول', history: [], bankAccountId: 'ba1', isCleared: false }
];
const mockTreasuryDocs: TreasuryDoc[] = [
    { id: 't1', docNumber: 2001, date: formatDate(daysAgo(-5)), partyId: 'p1', partyName: 'مشتری آلفا', amount: 2500000, paymentMethod: 'کارتخوان', description: 'دریافت از مشتری آلفا', type: 'دریافت', transactionId: '12345', bankAccountId: 'ba2', isCleared: true, status: 'نهایی' },
    { id: 't2', docNumber: 3001, date: formatDate(daysAgo(-4)), partyId: 'p2', partyName: 'تامین کننده بتا', amount: 150000, paymentMethod: 'حواله', description: 'پرداخت قبض اینترنت', type: 'پرداخت', bankAccountId: 'ba1', isCleared: true, status: 'نهایی' },
    { id: 't3', docNumber: 2002, date: formatDate(daysAgo(-2)), partyId: 'p4', partyName: 'آقای رضایی (مشتری)', amount: 8250000, paymentMethod: 'چک', description: 'دریافت چک شماره ۴۴۵۵۶۶', type: 'دریافت', checkNumber: '445566', checkDueDate: formatDate(daysAgo(15)), bankName: 'ملی', bankAccountId: 'ba2', isCleared: false, status: 'نهایی' },
    { id: 't4', docNumber: 2003, date: formatDate(daysAgo(-3)), partyId: 'p1', partyName: 'مشتری آلفا', amount: 4800000, paymentMethod: 'حواله', description: 'واریز وجه از مشتری آلفا', type: 'دریافت', transactionId: '67890', bankAccountId: 'ba1', isCleared: false, status: 'نهایی' },
];
const mockAccounts: AccountNode[] = [
  { code: '1', name: 'دارایی‌ها', type: 'group', children: [ { code: '11', name: 'دارایی‌های جاری', type: 'group', children: [ { code: '1101', name: 'موجودی نقد و بانک', type: 'account' }, { code: '1103', name: 'حساب‌ها و اسناد دریافتنی تجاری', type: 'account', linkedTafsiliGroups: ['tg1'] }, { code: '1104', name: 'صندوق', type: 'account' }, { code: '1105', name: 'موجودی کالا', type: 'account' } ] }, { code: '12', name: 'دارایی‌های غیرجاری', type: 'group', children: [ { code: '1201', name: 'دارایی‌های ثابت مشهود', type: 'account' }, { code: '1202', name: 'استهلاک انباشته دارایی‌های ثابت', type: 'account' } ] } ] },
  { code: '2', name: 'بدهی‌ها', type: 'group', children: [ { code: '21', name: 'بدهی‌های جاری', type: 'group', children: [ { code: '2101', name: 'حساب‌ها و اسناد پرداختنی تجاری', type: 'account', linkedTafsiliGroups: ['tg1'] }, { code: '2102', name: 'سایر حساب‌های پرداختنی', type: 'account' }, { code: '2105', name: 'مالیات پرداختنی', type: 'account' } ] }, { code: '22', name: 'بدهی‌های غیرجاری', type: 'group', children: [ { code: '2201', name: 'تسهیلات مالی بلندمدت', type: 'account' } ] } ] },
  { code: '3', name: 'حقوق صاحبان سهام', type: 'group', children: [ { code: '3101', name: 'سرمایه', type: 'account'}, { code: '3103', name: 'سود انباشته', type: 'account' } ] },
  { code: '4', name: 'درآمدها', type: 'group', children: [ { code: '41', name: 'درآمدهای عملیاتی', type: 'group', children: [ { code: '4101', name: 'فروش', type: 'account'} ] } ] },
  { code: '5', name: 'هزینه‌ها', type: 'group', children: [ { code: '51', name: 'بهای تمام شده', type: 'group', children: [ { code: '5101', name: 'بهای تمام شده کالای فروش رفته', type: 'account'} ] }, { code: '52', name: 'هزینه‌های عمومی', type: 'group', children: [ { code: '5201', name: 'هزینه حقوق و دستمزد', type: 'account', linkedTafsiliGroups: ['tg2']}, { code: '5202', name: 'هزینه اجاره', type: 'account', linkedTafsiliGroups: ['tg2'] }, { code: '5203', name: 'هزینه استهلاک', type: 'account' }, { code: '5204', name: 'کسری و اضافات صندوق', type: 'account' } ] } ] }
];
const mockGoods: Good[] = [
    { id: 'g1', code: '101', name: 'صندلی اداری مدل A', unit: 'عدد', stock: 50, purchasePrice: 1500000, salePrice: 2200000, category: 'اثاثه', inventoryAccountCode: '1105', cogsAccountCode: '5101', type: 'Finished Good' },
    { id: 'g2', code: '102', name: 'میز کار اداری', unit: 'عدد', stock: 30, purchasePrice: 2500000, salePrice: 4000000, category: 'اثاثه', inventoryAccountCode: '1105', cogsAccountCode: '5101', type: 'Finished Good' },
    { id: 'g3', code: '201', name: 'لپتاپ ProBook G10', unit: 'عدد', stock: 20, purchasePrice: 28000000, salePrice: 35000000, category: 'دیجیتال', inventoryAccountCode: '1105', cogsAccountCode: '5101', type: 'Finished Good' },
    { id: 'g4', code: '301', name: 'کاغذ A4 بسته 500 عددی', unit: 'بسته', stock: 200, purchasePrice: 120000, salePrice: 150000, category: 'ملزومات', inventoryAccountCode: '1105', cogsAccountCode: '5101', type: 'Raw Material' },
    { id: 'g5', code: 'RM-101', name: 'پارچه صندلی (متر)', unit: 'متر', stock: 100, purchasePrice: 80000, salePrice: 0, category: 'مواد اولیه', inventoryAccountCode: '1105', cogsAccountCode: '5101', type: 'Raw Material' },
    { id: 'g6', code: 'RM-102', name: 'فوم صندلی', unit: 'عدد', stock: 50, purchasePrice: 120000, salePrice: 0, category: 'مواد اولیه', inventoryAccountCode: '1105', cogsAccountCode: '5101', type: 'Raw Material' },
];
const mockParties: Party[] = [
    { id: 'p1', code: '1001', name: 'مشتری آلفا', type: 'حقوقی', nationalId: '12345678901', phone: '021-88888888', address: 'تهران' },
    { id: 'p2', code: '2001', name: 'تامین کننده بتا', type: 'حقوقی', nationalId: '10987654321', phone: '021-77777777', address: 'اصفهان' },
    { id: 'p3', code: '2002', name: 'فروشگاه تجهیزات گاما', type: 'حقوقی', nationalId: '11223344556', phone: '031-33333333', address: 'شیراز' },
    { id: 'p4', code: '1002', name: 'آقای رضایی (مشتری)', type: 'حقیقی', nationalId: '0012345678', phone: '09123456789', address: 'کرج' }
];
const mockSupplierInvoices: SupplierInvoice[] = [
    { id: 'si1', invoiceNumber: '98-1403', supplierId: 'p2', supplierName: 'تامین کننده بتا', invoiceDate: formatDate(daysAgo(-45)), dueDate: formatDate(daysAgo(-15)), dueDateObj: daysAgo(-15), totalAmount: 15000000, paidAmount: 15000000, status: 'پرداخت شده', lines: [], subtotal: 13761468, tax: 1238532 },
    { id: 'si2', invoiceNumber: 'F-6548', supplierId: 'p3', supplierName: 'فروشگاه تجهیزات گاما', invoiceDate: formatDate(daysAgo(-35)), dueDate: formatDate(daysAgo(5)), dueDateObj: daysAgo(5), totalAmount: 28000000, paidAmount: 10000000, status: 'پرداخت قسمتی', lines: [], subtotal: 25688073, tax: 2311927 },
    { id: 'si3', invoiceNumber: 'INV-1020', supplierId: 'p2', supplierName: 'تامین کننده بتا', invoiceDate: formatDate(daysAgo(-20)), dueDate: formatDate(daysAgo(10)), dueDateObj: daysAgo(10), totalAmount: 8500000, paidAmount: 0, status: 'ثبت شده', lines: [], subtotal: 7798165, tax: 701835 },
    { id: 'si4', invoiceNumber: 'F-7100', supplierId: 'p3', supplierName: 'فروشگاه تجهیزات گاما', invoiceDate: formatDate(daysAgo(-80)), dueDate: formatDate(daysAgo(-50)), dueDateObj: daysAgo(-50), totalAmount: 4200000, paidAmount: 0, status: 'ثبت شده', lines: [], subtotal: 3853211, tax: 346789 },
    { id: 'si5', invoiceNumber: 'T-500', supplierId: 'p2', supplierName: 'تامین کننده بتا', invoiceDate: formatDate(daysAgo(-110)), dueDate: formatDate(daysAgo(-80)), dueDateObj: daysAgo(-80), totalAmount: 12000000, paidAmount: 0, status: 'ثبت شده', lines: [], subtotal: 11009174, tax: 990826 },
];
const mockSupplierPayments: SupplierPayment[] = [
    { id: 'sp1', paymentNumber: 101, supplierId: 'p2', supplierName: 'تامین کننده بتا', paymentDate: formatDate(daysAgo(-10)), amount: 15000000, paymentMethod: 'حواله', appliedInvoices: [{ invoiceId: 'si1', amount: 15000000 }] },
    { id: 'sp2', paymentNumber: 102, supplierId: 'p3', supplierName: 'فروشگاه تجهیزات گاما', paymentDate: formatDate(daysAgo(-5)), amount: 10000000, paymentMethod: 'چک', bankName: 'ملت', appliedInvoices: [{ invoiceId: 'si2', amount: 10000000 }] }
];
const mockRecurringEntries: RecurringEntry[] = [
    { id: 're1', name: 'هزینه اجاره ماهانه دفتر', frequency: 'ماهانه', status: 'فعال', startDate: '2024-01-01', nextDueDate: '۱۴۰۳/۰۵/۳۱', lines: [
        { accountCode: '5202', accountName: 'هزینه اجاره', description: 'اجاره مرداد', debit: 50000000, credit: 0 },
        { accountCode: '1101', accountName: 'موجودی نقد و بانک', description: 'پرداخت اجاره مرداد', debit: 0, credit: 50000000 },
    ]},
    { id: 're2', name: 'هزینه استهلاک سالانه اثاثه', frequency: 'سالانه', status: 'فعال', startDate: '2024-01-01', nextDueDate: '۱۴۰۳/۱۲/۲۹', lines: []},
];
const mockJournalEntryTemplates: JournalEntryTemplate[] = [
    { id: 'tpl1', name: 'ثبت حقوق و دستمزد ماهانه', description: 'الگوی استاندارد برای ثبت سند حقوق', lines: [
        { accountCode: '5201', accountName: 'هزینه حقوق و دستمزد', description: 'حقوق پایه', debit: 0, credit: 0 },
        { accountCode: '2102', accountName: 'سایر حساب‌های پرداختنی', description: 'مالیات پرداختنی', debit: 0, credit: 0 },
        { accountCode: '2102', accountName: 'سایر حساب‌های پرداختنی', description: 'بیمه پرداختنی', debit: 0, credit: 0 },
        { accountCode: '1101', accountName: 'موجودی نقد و بانک', description: 'بانک پرداخت حقوق', debit: 0, credit: 0 },
    ]},
];
const mockInvoices: Invoice[] = [
    { 
        id: 'inv1', invoiceNumber: 'F-1403-101', customerId: 'p1', customerName: 'مشتری آلفا', 
        issueDate: formatDate(daysAgo(-50)), dueDate: formatDate(daysAgo(-20)), dueDateObj: daysAgo(-20), 
        total: 23980000, paidAmount: 23980000, status: 'پرداخت شده',
        lines: [{ id: 'inv1-l1', itemCode: '101', itemName: 'صندلی اداری مدل A', quantity: 10, rate: 2200000 }], 
        subtotal: 22000000, tax: 1980000, discount: 0, 
        customerAddress: 'تهران', customerEmail: '', notes: '', journalEntryId: 'inv-j-1' 
    },
    { 
        id: 'inv2', invoiceNumber: 'F-1403-102', customerId: 'p4', customerName: 'آقای رضایی (مشتری)', 
        issueDate: formatDate(daysAgo(-40)), dueDate: formatDate(daysAgo(-10)), dueDateObj: daysAgo(-10), 
        total: 38150000, paidAmount: 0, status: 'ثبت نهایی', 
        lines: [{ id: 'inv2-l1', itemCode: '201', itemName: 'لپتاپ ProBook G10', quantity: 1, rate: 35000000 }],
        subtotal: 35000000, tax: 3150000, discount: 0, 
        customerAddress: 'کرج', customerEmail: '', notes: '' 
    },
    { 
        id: 'inv3', invoiceNumber: 'F-1403-103', customerId: 'p1', customerName: 'مشتری آلفا', 
        issueDate: formatDate(daysAgo(-25)), dueDate: formatDate(daysAgo(5)), dueDateObj: daysAgo(5), 
        total: 17440000, paidAmount: 5000000, status: 'پرداخت قسمتی', 
        lines: [
            { id: 'inv3-l1', itemCode: '102', itemName: 'میز کار اداری', quantity: 4, rate: 4000000 }
        ],
        subtotal: 16000000, tax: 1440000, discount: 0, 
        customerAddress: 'تهران', customerEmail: '', notes: '' 
    },
    { 
        id: 'inv4', invoiceNumber: 'F-1403-104', customerId: 'p1', customerName: 'مشتری آلفا', 
        issueDate: formatDate(daysAgo(-80)), dueDate: formatDate(daysAgo(-50)), dueDateObj: daysAgo(-50), 
        total: 817500, paidAmount: 0, status: 'پیش‌نویس',
        lines: [{ id: 'inv4-l1', itemCode: '301', itemName: 'کاغذ A4 بسته 500 عددی', quantity: 5, rate: 150000 }], 
        subtotal: 750000, tax: 67500, discount: 0, 
        customerAddress: 'تهران', customerEmail: '', notes: '' 
    },
    {
        id: 'inv5', invoiceNumber: 'F-1403-105', customerId: 'p4', customerName: 'آقای رضایی (مشتری)',
        issueDate: formatDate(daysAgo(-15)), dueDate: formatDate(daysAgo(15)), dueDateObj: daysAgo(15),
        total: 9592000, paidAmount: 0, status: 'ثبت نهایی',
        lines: [
             { id: 'inv5-l1', itemCode: '101', itemName: 'صندلی اداری مدل A', quantity: 4, rate: 2200000 }
        ],
        subtotal: 8800000, tax: 792000,
        discount: 0,
        customerAddress: 'کرج', customerEmail: '', notes: ''
    }
];
const mockCustomerReceipts: CustomerReceipt[] = [
    { id: 'cr1', receiptNumber: 201, customerId: 'p1', customerName: 'مشتری آلفا', paymentDate: formatDate(daysAgo(-15)), amount: 22000000, paymentMethod: 'حواله', appliedInvoices: [{ invoiceId: 'inv1', amount: 22000000 }] },
    { id: 'cr2', receiptNumber: 202, customerId: 'p1', customerName: 'مشتری آلفا', paymentDate: formatDate(daysAgo(-2)), amount: 5000000, paymentMethod: 'کارتخوان', appliedInvoices: [{ invoiceId: 'inv3', amount: 5000000 }] },
];
const mockCostCenters: CostCenterNode[] = [
  { code: '1000', name: 'مراکز هزینه خدماتی', type: 'group', children: [ { code: '1100', name: 'اداری و عمومی', type: 'Service Center', children: [ { code: '1101', name: 'منابع انسانی', type: 'Service Center'}, { code: '1102', name: 'فناوری اطلاعات', type: 'Service Center'}]}, { code: '1200', name: 'نگهداری و تعمیرات', type: 'Service Center'}] },
  { code: '2000', name: 'مراکز هزینه تولیدی', type: 'group', children: [ { code: '2100', name: 'دایره مونتاژ', type: 'Cost Center'}, { code: '2200', name: 'دایره بسته‌بندی', type: 'Cost Center'}]},
  { code: '3000', name: 'مراکز سود', type: 'group', children: [{ code: '3100', name: 'خط تولید محصول A', type: 'Profit Center'}, { code: '3200', name: 'خط تولید محصول B', type: 'Profit Center'}]}
];
const mockBudgets: Budget[] = [
    {
        id: 'b1', fiscalYear: 1403, version: 'بودجه اصلی', dimension: 'account', lines: [
            { dimensionCode: '5201', monthlyAmounts: [140, 140, 140, 150, 150, 150, 150, 150, 150, 160, 160, 160].map(m => m * 1000000) },
            { dimensionCode: '5202', monthlyAmounts: Array(12).fill(50000000) },
        ]
    }
];
const mockFiscalYear: FiscalYearStatus = { year: 1403, status: 'باز', closingStep: 0 };
const mockStandardCosts: StandardCost[] = [
    { goodId: 'g1', materialStdPrice: 1450000, materialStdQty: 1, laborStdRate: 50000, laborStdHours: 2, overheadStdRate: 25000 },
];
const mockActualProductionData: ActualProductionData = { goodId: 'g1', producedQty: 100, actualMaterialPrice: 1480000, actualMaterialQty: 102, actualLaborRate: 52000, actualLaborHours: 210, actualOverhead: 5500000 };
const mockActivities: Activity[] = [
    { id: 'act1', name: 'راه‌اندازی ماشین‌آلات', costPool: 50000000, costDriverName: 'تعداد راه‌اندازی', costDriverVolume: 100 },
    { id: 'act2', name: 'کنترل کیفیت', costPool: 35000000, costDriverName: 'تعداد بازرسی', costDriverVolume: 500 },
    { id: 'act3', name: 'جابجایی مواد', costPool: 20000000, costDriverName: 'تعداد جابجایی', costDriverVolume: 1000 },
];
const mockInternalOrders: InternalOrder[] = [
    { id: 'io1', orderNumber: 40001, description: 'کمپین تبلیغاتی محصول جدید', status: 'آزاد شده', orderType: 'بازاریابی', responsiblePerson: 'مدیر فروش', plannedCosts: 50000000, actualCosts: 12000000 },
];
const mockAssets: FixedAsset[] = [
    { id: 'fa1', code: '1001', description: 'دستگاه پرس صنعتی', assetClassId: 'ac1', acquisitionDate: '2023-03-21', acquisitionCost: 1200000000, salvageValue: 50000000, status: 'Active' },
    { id: 'fa2', code: '1002', description: 'لپتاپ مدیرعامل', assetClassId: 'ac2', acquisitionDate: '2024-01-15', acquisitionCost: 80000000, salvageValue: 5000000, status: 'Active' },
];
const mockAssetClasses: AssetClass[] = [
    { id: 'ac1', name: 'ماشین آلات', depreciationMethod: 'Straight-line', usefulLife: 10 },
    { id: 'ac2', name: 'تجهیزات کامپیوتری', depreciationMethod: 'Straight-line', usefulLife: 3 },
];
const mockAssetTransactions: AssetTransaction[] = [
    { id: 'at1', assetId: 'fa1', assetDescription: 'دستگاه پرس صنعتی', type: 'Acquisition', date: '۱۴۰۱/۱۲/۳۰', amount: 1200000000 },
    { id: 'at2', assetId: 'fa2', assetDescription: 'لپتاپ مدیرعامل', type: 'Acquisition', date: '۱۴۰۲/۱۰/۲۵', amount: 80000000 },
];
const mockMaintenanceObjects: MaintenanceObject[] = [
    { id: 'mo1', name: 'کمپرسور هوا', location: 'سالن تولید A', type: 'Machine' },
    { id: 'mo2', name: 'دستگاه CNC مدل XYZ', location: 'سالن تولید B', type: 'Machine' },
];
const mockMaintenanceOrders: MaintenanceOrder[] = [
    { id: 'mord1', orderNumber: 8001, objectId: 'mo1', objectName: 'کمپرسور هوا', description: 'نشتی هوا دارد', type: 'Corrective', status: 'Open', creationDate: formatDate(daysAgo(-2)) },
];
const mockPreventivePlans: PreventivePlan[] = [
    { id: 'pp1', planName: 'بازرسی ماهانه کمپرسور', objectId: 'mo1', objectName: 'کمپرسور هوا', taskDescription: 'بازرسی فیلترها و روغن', frequency: 30, lastRun: formatDate(daysAgo(-15)), nextRun: formatDate(daysAgo(15)) },
];
const mockTaxRates: TaxRate[] = [
    { id: 'tax1', startDate: '2014-04-01', endDate: '2021-03-20', vatRate: 8, dutiesRate: 1 },
    { id: 'tax2', startDate: '2021-03-21', endDate: null, vatRate: 9, dutiesRate: 0 },
];
const mockCurrencies: Currency[] = [
    { id: 'curr1', code: 'USD', name: 'دلار آمریکا' },
    { id: 'curr2', code: 'EUR', name: 'یورو' },
    { id: 'curr3', code: 'AED', name: 'درهم امارات' },
];
const mockExchangeRates: ExchangeRate[] = Array.from({length: 30}).map((_, i) => ({
    id: `rate${i}`, currencyId: 'curr1', date: daysAgo(i - 30).toISOString().split('T')[0], rate: 42000 + (Math.random() - 0.5) * 500
}));
const mockTafsiliGroups: TafsiliGroup[] = [
    { id: 'tg1', name: 'اشخاص' },
    { id: 'tg2', name: 'مراکز هزینه' },
    { id: 'tg3', name: 'پروژه‌ها' },
];
const mockTafsiliAccounts: TafsiliAccount[] = [
    { id: 'ta1', groupId: 'tg1', code: '1001', name: 'مشتری آلفا', linkedGLAccounts: ['1103'] },
    { id: 'ta2', groupId: 'tg1', code: '2001', name: 'تامین کننده بتا', linkedGLAccounts: ['2101'] },
    { id: 'ta3', groupId: 'tg2', code: 'C101', name: 'دایره فروش', linkedGLAccounts: ['5201', '5202'] },
];
const mockBanks: Bank[] = [
    { id: 'b1', code: '017', name: 'بانک ملی ایران' },
    { id: 'b2', code: '012', name: 'بانک ملت' },
    { id: 'b3', code: '019', name: 'بانک صادرات ایران' },
];
const mockBankAccounts: BankAccount[] = [
    { id: 'ba1', bankName: 'ملت', branchName: 'مرکزی', accountNumber: '1234567890', iban: 'IR980120000000001234567890', accountType: 'جاری', currency: 'ریال', isActive: true, balance: 158200000 },
    { id: 'ba2', bankName: 'ملی', branchName: 'شعبه ارزی', accountNumber: '0987654321', iban: 'IR87017000000010987654321', accountType: 'جاری', currency: 'ریال', isActive: true, balance: 95400000 },
    { id: 'ba3', bankName: 'صادرات', branchName: 'الف', accountNumber: '5555555555', iban: 'IR550190000000205555555555', accountType: 'پس‌انداز', currency: 'ریال', isActive: false, balance: 12000000 },
];
const mockBankStatement: BankStatementTransaction[] = [
    { id: 'bs1', date: formatDate(daysAgo(-12)), description: 'واریز حقوق', debit: 0, credit: 150000000 },
    { id: 'bs2', date: formatDate(daysAgo(-10)), description: 'خرید آنلاین دیجی کالا', debit: 2500000, credit: 0 },
    { id: 'bs3', date: formatDate(daysAgo(-8)), description: 'واریز از مشتری XYZ', debit: 0, credit: 2500000 },
    { id: 'bs4', date: formatDate(daysAgo(-8)), description: 'چک شماره 112233', debit: 0, credit: 15000000 },
    { id: 'bs6', date: formatDate(daysAgo(-5)), description: 'سود سپرده', debit: 0, credit: 50000 },
    { id: 'bs7', date: formatDate(daysAgo(-3)), description: 'کارمزد بانکی', debit: 10000, credit: 0 },
    { id: 'bs8', date: formatDate(daysAgo(-2)), description: 'پرداخت چک 999888', debit: 7200000, credit: 0 },
];
const mockCashDesks: CashDesk[] = [
  { id: 'cd1', name: 'صندوق اصلی', balance: 5000000 },
  { id: 'cd2', name: 'تنخواه گردان اداری', balance: 1500000 },
];

const mockQuotes: Quote[] = [
    { id: 'q1', quoteNumber: 'Q-1403-01', customerId: 'p4', customerName: 'آقای رضایی (مشتری)', issueDate: formatDate(daysAgo(-20)), validityDate: formatDate(daysAgo(-5)), total: 35000000, status: 'ارسال شده', lines: [] },
    { id: 'q2', quoteNumber: 'Q-1403-02', customerId: 'p1', customerName: 'مشتری آلفا', issueDate: formatDate(daysAgo(-10)), validityDate: formatDate(daysAgo(5)), total: 50000000, status: 'پذیرفته شده', lines: [] }
];
const mockSalesOrders: SalesOrder[] = [
    { id: 'so1', orderNumber: 'SO-101', quoteId: 'q2', customerId: 'p1', customerName: 'مشتری آلفا', orderDate: formatDate(daysAgo(-8)), requiredDeliveryDate: formatDate(daysAgo(10)), total: 50000000, status: 'باز', lines: [{id: 'sol1', itemCode: 'g3', itemName: 'لپتاپ ProBook G10', quantity: 10, rate: 35000000}] }
];
const mockDeliveryNotes: DeliveryNote[] = [
    { id: 'dn1', deliveryNumber: 'DN-201', orderId: 'so1', deliveryDate: formatDate(daysAgo(-2)), status: 'ارسال شده', lines: [{id: 'dnl1', goodId: 'g3', goodName: 'لپتاپ ProBook G10', quantityOrdered: 10, quantityShipped: 10}] }
];
const mockSalesContracts: SalesContract[] = [
    { id: 'sc1', contractNumber: 'C-001', customerId: 'p1', customerName: 'مشتری آلفا', startDate: '۱۴۰۳/۰۱/۰۱', endDate: '۱۴۰۳/۱۲/۲۹', totalValue: 200000000, status: 'فعال' }
];

const mockOpportunities: Opportunity[] = [
    { id: 'opp1', name: 'پروژه پیاده‌سازی ERP برای مشتری آلفا', customerId: 'p1', customerName: 'مشتری آلفا', stage: 'ارسال پیشنهاد', value: 250000000, probability: 50, expectedCloseDate: formatDate(daysAgo(30)), description: 'پیاده‌سازی ماژول‌های مالی و انبار' },
    { id: 'opp2', name: 'فروش ۱۰ دستگاه لپتاپ به مشتری جدید', customerId: 'p4', customerName: 'آقای رضایی (مشتری)', stage: 'مذاکره', value: 350000000, probability: 75, expectedCloseDate: formatDate(daysAgo(15)), description: '' },
    { id: 'opp3', name: 'تمدید قرارداد پشتیبانی', customerId: 'p1', customerName: 'مشتری آلفا', stage: 'ارزیابی', value: 50000000, probability: 20, expectedCloseDate: formatDate(daysAgo(45)), description: 'تمدید قرارداد پشتیبانی سطح طلایی برای یک سال دیگر.' },
];
const mockTicketReplies: TicketReply[] = [
    {id: 'rep1', author: 'علی حسینی', message: 'در حال بررسی مشکل هستیم. لطفاً چند لحظه منتظر بمانید.', date: formatDate(daysAgo(-2))},
    {id: 'rep2', author: 'آقای رضایی (مشتری)', message: 'ممنون. همچنان منتظر پاسخ شما هستم.', date: formatDate(daysAgo(-1))},
];
const mockSupportTickets: SupportTicket[] = [
    { id: 'tkt1', ticketNumber: 101, subject: 'مشکل در ورود به سیستم', description: 'کاربر با نام کاربری test@example.com نمی‌تواند وارد سیستم شود. خطای "نام کاربری یا رمز عبور اشتباه است" دریافت می‌کند در حالی که اطلاعات صحیح است.', customerId: 'p4', customerName: 'آقای رضایی (مشتری)', createdDate: formatDate(daysAgo(-2)), status: 'در حال بررسی', priority: 'زیاد', assignedTo: 'علی حسینی', replies: mockTicketReplies },
    { id: 'tkt2', ticketNumber: 102, subject: 'گزارش فروش کار نمی‌کند', description: 'هنگام تلاش برای باز کردن گزارش فروش ماهانه، صفحه سفید نمایش داده می‌شود و هیچ خطایی وجود ندارد.', customerId: 'p1', customerName: 'مشتری آلفا', createdDate: formatDate(daysAgo(-1)), status: 'جدید', priority: 'فوری', assignedTo: 'پشتیبانی سطح ۲', replies: [] },
    { id: 'tkt3', ticketNumber: 103, subject: 'درخواست افزودن فیلد جدید', description: 'لطفاً فیلد "کد پستی" را به فرم مشتریان اضافه کنید.', customerId: 'p1', customerName: 'مشتری آلفا', createdDate: formatDate(daysAgo(-5)), status: 'حل شده', priority: 'کم', assignedTo: 'سارا محمدی', replies: [] },
];
const mockServiceContracts: ServiceContract[] = [
    { id: 'svc1', contractNumber: 'SVC-1001', customerId: 'p1', customerName: 'مشتری آلفا', startDate: '1403/01/01', endDate: '1403/12/29', serviceLevel: 'طلایی', monthlyFee: 5000000, status: 'فعال', description: 'پشتیبانی کامل ۲۴/۷ برای ماژول‌های مالی و انبار.' },
    { id: 'svc2', contractNumber: 'SVC-1002', customerId: 'p4', customerName: 'آقای رضایی (مشتری)', startDate: '1402/10/01', endDate: '1403/09/30', serviceLevel: 'نقره‌ای', monthlyFee: 2500000, status: 'در شرف انقضا', description: 'پشتیبانی ۸ ساعته در روزهای کاری.' },
];
const mockFieldServiceOrders: FieldServiceOrder[] = [
    { id: 'fso1', orderNumber: 'FS-501', ticketId: 'tkt1', customerId: 'p4', customerName: 'آقای رضایی (مشتری)', address: 'کرج', serviceDescription: 'بازدید حضوری برای رفع مشکل ورود به سیستم', scheduledDate: formatDate(daysAgo(1)), technician: 'رضا احمدی', status: 'زمان‌بندی شده', technicianNotes: '' },
    { id: 'fso2', orderNumber: 'FS-502', customerId: 'p1', customerName: 'مشتری آلفا', address: 'تهران', serviceDescription: 'نصب و راه‌اندازی سرور جدید', scheduledDate: formatDate(daysAgo(-3)), technician: 'مریم صالحی', status: 'تکمیل شده', technicianNotes: 'سرور با موفقیت نصب شد و داده‌های اولیه منتقل گردید.' },
];
const mockPOSTerminals: POSTerminal[] = [];
const mockPOSTransactions: POSTransaction[] = [];
const mockPOSCloseouts: POSCloseout[] = [];
const mockPriceLists: PriceList[] = [];
const mockDiscountRules: DiscountRule[] = [];
const mockPricingProcedure: PricingProcedure = { id: 'proc1', name: 'رویه استاندارد فروش', steps: [] };

// MM MOCK DATA
const mockPurchaseRequests: PurchaseRequest[] = [
    { id: 'pr1', requestNumber: 3001, requester: 'علی رضایی', requestDate: formatDate(daysAgo(-10)), status: 'تایید شده', lines: [
        { id: 'pr1-l1', goodId: 'g1', goodName: 'صندلی اداری مدل A', quantity: 10, requiredDate: formatDate(daysAgo(5)) },
        { id: 'pr1-l2', goodId: 'g4', goodName: 'کاغذ A4 بسته 500 عددی', quantity: 50, requiredDate: formatDate(daysAgo(5)) },
    ], projectId: 'proj1'},
    { id: 'pr2', requestNumber: 3002, requester: 'سارا احمدی', requestDate: formatDate(daysAgo(-2)), status: 'در انتظار تایید', lines: [
        { id: 'pr2-l1', goodId: 'g3', goodName: 'لپتاپ ProBook G10', quantity: 5, requiredDate: formatDate(daysAgo(20)) },
    ]}
];
const mockPurchaseOrders: PurchaseOrder[] = [
    { id: 'po1', poNumber: 4001, supplierId: 'p2', supplierName: 'تامین کننده بتا', orderDate: formatDate(daysAgo(-8)), deliveryDate: formatDate(daysAgo(10)), totalAmount: 21000000, status: 'باز', lines: [
        { id: 'po1-l1', goodId: 'g1', goodName: 'صندلی اداری مدل A', quantity: 10, price: 1500000, total: 15000000 },
        { id: 'po1-l2', goodId: 'g4', goodName: 'کاغذ A4 بسته 500 عددی', quantity: 50, price: 120000, total: 6000000 },
    ], purchaseRequestId: 'pr1', projectId: 'proj1' },
     { id: 'po2', poNumber: 4002, supplierId: 'p3', supplierName: 'فروشگاه تجهیزات گاما', orderDate: formatDate(daysAgo(-20)), deliveryDate: formatDate(daysAgo(-2)), totalAmount: 50000000, status: 'دریافت کامل', lines: [
        { id: 'po2-l1', goodId: 'g2', goodName: 'میز کار اداری', quantity: 20, price: 2500000, total: 50000000 },
    ]}
];
const mockGoodsReceipts: GoodsReceipt[] = [
    { id: 'gr1', receiptNumber: 5001, purchaseOrderId: 'po2', receiptDate: formatDate(daysAgo(-2)), lines: [
        { id: 'gr1-l1', goodId: 'g2', goodName: 'میز کار اداری', quantityOrdered: 20, quantityReceived: 20 },
    ]}
];
const mockInventoryMovements: InventoryMovement[] = [
    { id: 'im1', date: formatDate(daysAgo(-2)), goodId: 'g2', goodName: 'میز کار اداری', quantity: 20, type: 'ورود', referenceDocId: 'gr1', referenceDocNumber: 'رسید 5001' },
    { id: 'im2', date: formatDate(daysAgo(-2)), goodId: 'g3', goodName: 'لپتاپ ProBook G10', quantity: -10, type: 'خروج', referenceDocId: 'dn1', referenceDocNumber: 'خروج DN-201' },
];
const mockStocktakes: Stocktake[] = [
    { id: 'st1', documentNumber: 6001, countDate: formatDate(daysAgo(-15)), status: 'ثبت شده', lines: [
        { id: 'g1', goodId: 'g1', goodName: 'صندلی اداری مدل A', bookQuantity: 52, countedQuantity: 50 },
        { id: 'g2', goodId: 'g2', goodName: 'میز کار اداری', bookQuantity: 10, countedQuantity: 10 },
    ], journalEntryId: 'je-st1'}
];

// NEW MM/WAREHOUSE MOCK DATA
const mockRFQs: RFQ[] = [
    { id: 'rfq1', rfqNumber: 2001, creationDate: formatDate(daysAgo(-9)), closingDate: formatDate(daysAgo(-2)), status: 'بسته شده', lines: [
        { id: 'rfq1-l1', goodId: 'g1', goodName: 'صندلی اداری مدل A', quantity: 10 },
        { id: 'rfq1-l2', goodId: 'g4', goodName: 'کاغذ A4 بسته 500 عددی', quantity: 50 },
    ], quotes: [
        { supplierId: 'p2', supplierName: 'تامین کننده بتا', price: 21000000, deliveryDays: 18 },
        { supplierId: 'p3', supplierName: 'فروشگاه تجهیزات گاما', price: 22500000, deliveryDays: 15 },
    ], purchaseRequestId: 'pr1' },
];

const mockPurchaseContracts: PurchaseContract[] = [
    { id: 'pc1', contractNumber: 'PC-1403-01', supplierId: 'p2', supplierName: 'تامین کننده بتا', startDate: formatDate(daysAgo(-180)), endDate: formatDate(daysAgo(185)), targetValue: 500000000, releasedValue: 120000000, status: 'فعال' },
];

const mockBatches: Batch[] = [
    { id: 'b1', batchNumber: 'BAT-2024-08-001', goodId: 'g2', goodName: 'میز کار اداری', manufactureDate: formatDate(daysAgo(-5)), expiryDate: undefined, quantity: 20, location: 'A-01-02' },
];

const mockSerialNumbers: SerialNumber[] = [
    { id: 'sn1', serialNumber: 'SN-PBG10-001', goodId: 'g3', goodName: 'لپتاپ ProBook G10', status: 'موجود', location: 'B-02-01' },
    { id: 'sn2', serialNumber: 'SN-PBG10-002', goodId: 'g3', goodName: 'لپتاپ ProBook G10', status: 'موجود', location: 'B-02-01' },
];

const mockInspectionLots: InspectionLot[] = [
    { id: 'il1', lotNumber: 7001, goodId: 'g2', goodName: 'میز کار اداری', quantity: 20, creationDate: formatDate(daysAgo(-2)), status: 'باز', goodsReceiptId: 'gr1' },
];

const mockWarehouseStructure: WarehouseStructureNode[] = [
    { id: 'wh1', name: 'انبار اصلی', type: 'انبار', children: [
        { id: 'sloc1', name: 'محل نگهداری مواد اولیه', type: 'محل نگهداری', children: [
            { id: 'aisleA', name: 'راهرو A', type: 'راهرو', children: [
                { id: 'rackA01', name: 'قفسه A-01', type: 'قفسه', children: [] }
            ]}
        ]},
        { id: 'sloc2', name: 'محل نگهداری محصول نهایی', type: 'محل نگهداری', children: []}
    ]}
];

const mockWarehouseStrategies = {
    putaway: [
        { id: 'ps1', name: 'جایگاه ثابت کالا', rule: 'جایگاه ثابت' },
        { id: 'ps2', name: 'اولین جایگاه خالی', rule: 'اولین خالی' },
    ] as PutawayStrategy[],
    picking: [
        { id: 'pk1', name: 'اولین ورودی، اولین خروجی', rule: 'FIFO' },
    ] as PickingStrategy[],
};

// --- PP MOCK DATA ---
const mockBOMs: BOM[] = [
    { id: 'bom1', goodId: 'g1', goodName: 'صندلی اداری مدل A', items: [
        { id: 'bom1-i1', componentId: 'g5', componentName: 'پارچه صندلی (متر)', quantity: 2.5 },
        { id: 'bom1-i2', componentId: 'g6', componentName: 'فوم صندلی', quantity: 1 },
    ]}
];

const mockWorkCenters: WorkCenter[] = [
    { id: 'wc1', code: 'ASM-01', name: 'خط مونتاژ صندلی', capacity: 8 },
    { id: 'wc2', code: 'CUT-01', name: 'دستگاه برش پارچه', capacity: 8 },
];

const mockRoutings: Routing[] = [
    { id: 'rt1', goodId: 'g1', goodName: 'صندلی اداری مدل A', operations: [
        { id: 'rt1-op1', operationNumber: 10, description: 'برش پارچه', workCenterId: 'wc2', setupTime: 5, runTime: 2 },
        { id: 'rt1-op2', operationNumber: 20, description: 'مونتاژ نهایی', workCenterId: 'wc1', setupTime: 15, runTime: 10 },
    ]}
];

const mockProductionOrders: ProductionOrder[] = [
    { id: 'pro1', orderNumber: 5001, goodId: 'g1', goodName: 'صندلی اداری مدل A', quantity: 50, startDate: formatDate(daysAgo(-5)), endDate: formatDate(daysAgo(10)), status: 'آزاد شده', bomId: 'bom1', routingId: 'rt1',
      standardCosts: { material: 550000 * 50, labor: 150000 * 50, overhead: 0 },
      actualCosts: { material: 0, labor: 0, overhead: 0 }
    },
    { id: 'pro2', orderNumber: 5002, goodId: 'g2', goodName: 'میز کار اداری', quantity: 20, startDate: formatDate(daysAgo(-2)), endDate: formatDate(daysAgo(15)), status: 'ایجاد شده', bomId: 'bom2', routingId: 'rt2' },
];

// --- PS MOCK DATA ---
const mockProjects: ProjectDefinition[] = [
  { id: 'proj1', projectCode: 'P-1001', description: 'پروژه پیاده‌سازی CRM برای مشتری آلفا', customerName: 'مشتری آلفا', startDate: formatDateISO(daysAgo(-60)), endDate: formatDateISO(daysAgo(120)), status: 'در حال اجرا', budget: 250000000, actualCost: 85000000 },
  { id: 'proj2', projectCode: 'P-1002', description: 'پروژه توسعه وب‌سایت داخلی', customerName: 'داخلی', startDate: formatDateISO(daysAgo(-30)), endDate: formatDateISO(daysAgo(60)), status: 'تعریف شده', budget: 80000000, actualCost: 5000000 },
];

const mockWBS: WBSNode[] = [
  { id: 'wbs1', projectId: 'proj1', code: 'P-1001', description: 'پیاده‌سازی CRM', status: 'آزاد شده', plannedCost: 250000000, actualCost: 85000000, parentId: null },
  { id: 'wbs1.1', projectId: 'proj1', code: 'P-1001.1', description: 'فاز ۱: تحلیل و طراحی', status: 'تکمیل شده', plannedCost: 50000000, actualCost: 55000000, parentId: 'wbs1' },
  { id: 'wbs1.2', projectId: 'proj1', code: 'P-1001.2', description: 'فاز ۲: پیاده‌سازی و توسعه', status: 'آزاد شده', plannedCost: 150000000, actualCost: 30000000, parentId: 'wbs1' },
  { id: 'wbs1.3', projectId: 'proj1', code: 'P-1001.3', description: 'فاز ۳: آموزش و استقرار', status: 'باز', plannedCost: 50000000, actualCost: 0, parentId: 'wbs1' },
  { id: 'wbs1.2.1', projectId: 'proj1', code: 'P-1001.2.1', description: 'توسعه ماژول فروش', status: 'آزاد شده', plannedCost: 70000000, actualCost: 10000000, parentId: 'wbs1.2' },
  { id: 'wbs1.2.2', projectId: 'proj1', code: 'P-1001.2.2', description: 'توسعه ماژول خدمات', status: 'باز', plannedCost: 80000000, actualCost: 20000000, parentId: 'wbs1.2' },
];

const mockActivities_PS: NetworkActivity[] = [
    { id: 'act1', wbsId: 'wbs1.1', activityNumber: '10', description: 'جمع‌آوری نیازمندی‌ها', duration: 10, status: 'تایید شده', dependencies: [], plannedStartDate: formatDateISO(daysAgo(-60)), plannedEndDate: formatDateISO(daysAgo(-50)) },
    { id: 'act2', wbsId: 'wbs1.1', activityNumber: '20', description: 'طراحی پروتوتایپ', duration: 15, status: 'تایید شده', dependencies: [{activityId: 'act1', type: 'FS'}], plannedStartDate: formatDateISO(daysAgo(-49)), plannedEndDate: formatDateISO(daysAgo(-35)) },
    { id: 'act3', wbsId: 'wbs1.2.1', activityNumber: '30', description: 'توسعه Backend ماژول فروش', duration: 25, status: 'در حال انجام', dependencies: [{activityId: 'act2', type: 'FS'}], plannedStartDate: formatDateISO(daysAgo(-34)), plannedEndDate: formatDateISO(daysAgo(-10)) },
    { id: 'act4', wbsId: 'wbs1.2.1', activityNumber: '40', description: 'توسعه Frontend ماژول فروش', duration: 20, status: 'باز', dependencies: [{activityId: 'act3', type: 'SS'}], plannedStartDate: formatDateISO(daysAgo(-24)), plannedEndDate: formatDateISO(daysAgo(-5)) },
    { id: 'act5', wbsId: 'wbs1.2.2', activityNumber: '50', description: 'توسعه Backend ماژول خدمات', duration: 30, status: 'باز', dependencies: [{activityId: 'act2', type: 'FS'}], plannedStartDate: formatDateISO(daysAgo(-34)), plannedEndDate: formatDateISO(daysAgo(-5)) },
    { id: 'act6', wbsId: 'wbs1.3', activityNumber: '60', description: 'آماده‌سازی محتوای آموزشی', duration: 10, status: 'باز', dependencies: [], plannedStartDate: formatDateISO(daysAgo(0)), plannedEndDate: formatDateISO(daysAgo(9)) },
];

const mockTimesheets: TimesheetEntry[] = [
    { id: 'ts1', userId: 'u1', userName: 'علی رضایی', wbsId: 'wbs1.2.1', workDate: formatDateISO(daysAgo(-5)), hours: 8, description: 'کار روی APIهای ماژول فروش', status: 'تایید شده' },
    { id: 'ts2', userId: 'u1', userName: 'علی رضایی', wbsId: 'wbs1.2.1', workDate: formatDateISO(daysAgo(-4)), hours: 6, description: 'رفع باگ و تست', status: 'تایید شده' },
    { id: 'ts3', userId: 'u2', userName: 'سارا احمدی', wbsId: 'wbs1.2.2', workDate: formatDateISO(daysAgo(-3)), hours: 8, description: 'شروع کار روی ماژول خدمات', status: 'پیش‌نویس' },
];

const mockProjectBillings: ProjectBillingMilestone[] = [
    { id: 'pb1', projectId: 'proj1', description: 'پایان فاز ۱: تحلیل', dueDate: formatDate(daysAgo(-30)), amount: 50000000, status: 'پرداخت شده' },
    { id: 'pb2', projectId: 'proj1', description: 'پیشرفت ۵۰٪ فاز ۲', dueDate: formatDate(daysAgo(15)), amount: 75000000, status: 'صورت وضعیت شده' },
    { id: 'pb3', projectId: 'proj1', description: 'پایان فاز ۲: پیاده‌سازی', dueDate: formatDate(daysAgo(60)), amount: 75000000, status: 'برنامه‌ریزی شده' },
];

// --- Admin Mock Data ---
const mockRoles: Role[] = [
    { id: 'r1', name: 'مدیر سیستم' },
    { id: 'r2', name: 'حسابدار' },
    { id: 'r3', name: 'کاربر فروش' },
    { id: 'r4', name: 'مدیر انبار' },
];

const mockUsers: User[] = [
    { id: 'u1', username: 'admin', fullName: 'جان دو', roleId: 'r1', status: 'فعال', avatarUrl: 'https://picsum.photos/id/1005/100/100' },
    { id: 'u2', username: 'ali_rezaei', fullName: 'علی رضایی', roleId: 'r2', status: 'فعال', avatarUrl: 'https://picsum.photos/id/1011/100/100' },
    { id: 'u3', username: 'sara_ahmadi', fullName: 'سارا احمدی', roleId: 'r3', status: 'فعال', avatarUrl: 'https://picsum.photos/id/1027/100/100' },
    { id: 'u4', username: 'reza_mohammadi', fullName: 'رضا محمدی', roleId: 'r4', status: 'غیرفعال', avatarUrl: 'https://picsum.photos/id/1012/100/100' },
];

const mockCompanyInfo: CompanyInfo = {
    name: 'شرکت سپیدار سیستم آسیا',
    legalName: 'شرکت سهامی خاص سپیدار سیستم آسیا',
    nationalId: '10103388722',
    registrationNumber: '298696',
    address: 'تهران، خیابان ولیعصر، بالاتر از میدان ونک، کوچه عطار، پلاک ۱۰',
    phone: '021-81022000',
    email: 'info@sepidarsystem.com',
    website: 'https.sepidarsystem.com',
    logoUrl: 'https://www.sepidarsystem.com/wp-content/uploads/2022/01/logo.svg',
};

// --- HCM MOCK DATA ---
const mockEmployees: Employee[] = [
    { id: 'emp1', employeeId: '1001', fullName: 'علی رضایی', position: 'حسابدار ارشد', department: 'مالی', hireDate: '۱۴۰۰/۰۲/۱۵', status: 'فعال', avatarUrl: 'https://i.pravatar.cc/150?u=1001', email: 'ali.rezaei@example.com', phone: '09121112233' },
    { id: 'emp2', employeeId: '1002', fullName: 'سارا احمدی', position: 'کارشناس فروش', department: 'فروش', hireDate: '۱۴۰۱/۰۸/۰۱', status: 'فعال', avatarUrl: 'https://i.pravatar.cc/150?u=1002', email: 'sara.ahmadi@example.com', phone: '09124445566' },
    { id: 'emp3', employeeId: '1003', fullName: 'رضا محمدی', position: 'مدیر انبار', department: 'انبار', hireDate: '۱۳۹۹/۱۱/۲۰', status: 'فعال', avatarUrl: 'https://i.pravatar.cc/150?u=1003', email: 'reza.mohammadi@example.com', phone: '09127778899' },
    { id: 'emp4', employeeId: '1004', fullName: 'مریم حسینی', position: 'کارشناس منابع انسانی', department: 'منابع انسانی', hireDate: '۱۴۰۲/۰۵/۱۰', status: 'فعال', avatarUrl: 'https://i.pravatar.cc/150?u=1004', email: 'maryam.hosseini@example.com', phone: '09121234567' },
];

const mockOrgStructure: OrgUnit[] = [
    { id: 'org1', name: 'مدیریت عامل', manager: 'مدیر عامل', headcount: 50, children: [
        { id: 'org2', name: 'معاونت مالی و اداری', manager: 'علی رضایی', headcount: 10, children: [
            { id: 'org4', name: 'واحد مالی', headcount: 5 },
            { id: 'org5', name: 'واحد اداری', headcount: 5 },
        ]},
        { id: 'org3', name: 'معاونت فروش و بازاریابی', manager: 'سارا احمدی', headcount: 15 },
    ]}
];

const mockPayslips: Payslip[] = [
    { id: 'ps1', employeeId: '1001', period: 'مرداد ۱۴۰۳', grossSalary: 80000000, deductions: 15000000, netSalary: 65000000 },
    { id: 'ps2', employeeId: '1002', period: 'مرداد ۱۴۰۳', grossSalary: 60000000, deductions: 10000000, netSalary: 50000000 },
];

const mockAttendance: AttendanceRecord[] = [
    { id: 'att1', employeeId: '1001', employeeName: 'علی رضایی', date: formatDate(new Date()), checkIn: '08:55', checkOut: '17:35', status: 'حاضر' },
    { id: 'att2', employeeId: '1002', employeeName: 'سارا احمدی', date: formatDate(new Date()), checkIn: '09:05', checkOut: '17:30', status: 'حاضر' },
    { id: 'att3', employeeId: '1004', employeeName: 'مریم حسینی', date: formatDate(new Date()), checkIn: '--:--', checkOut: '--:--', status: 'مرخصی' },
];

const mockJobOpenings: JobOpening[] = [
    { id: 'job1', title: 'کارشناس فروش', department: 'فروش', status: 'باز' },
    { id: 'job2', title: 'برنامه نویس React', department: 'فناوری اطلاعات', status: 'باز' },
];

const mockCandidates: Candidate[] = [
    { id: 'cand1', jobId: 'job1', name: 'امیر قاسمی', stage: 'مصاحبه اولیه', avatarUrl: 'https://i.pravatar.cc/150?u=c1' },
    { id: 'cand2', jobId: 'job1', name: 'زهرا اکبری', stage: 'رزومه دریافتی', avatarUrl: 'https://i.pravatar.cc/150?u=c2' },
    { id: 'cand3', jobId: 'job2', name: 'نیما یوسفی', stage: 'مصاحبه فنی', avatarUrl: 'https://i.pravatar.cc/150?u=c3' },
];

const mockReviews: PerformanceReview[] = [
    { id: 'rev1', employeeId: '1001', employeeName: 'علی رضایی', reviewDate: '۱۴۰۲/۱۲/۱۵', rating: 4, reviewer: 'مدیر مالی' },
    { id: 'rev2', employeeId: '1002', employeeName: 'سارا احمدی', reviewDate: '۱۴۰۲/۱۲/۲۰', rating: 5, reviewer: 'مدیر فروش' },
];

const mockTrainings: TrainingCourse[] = [
    { id: 'trn1', title: 'اصول حسابداری پیشرفته', instructor: 'استاد محمودی', duration: '16 ساعت', enrolled: 12 },
    { id: 'trn2', title: 'تکنیک‌های مذاکره در فروش', instructor: 'دکتر صادقی', duration: '8 ساعت', enrolled: 25 },
];


export const App: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [activePage, setActivePage] = useState('dashboard');
    const [toasts, setToasts] = useState<ToastData[]>([]);
    
    // Financial Accounting State
    const [journalEntries, setJournalEntries] = useState(mockJournalEntries);
    const [accounts, setAccounts] = useState(mockAccounts);
    const [recurringEntries, setRecurringEntries] = useState(mockRecurringEntries);
    const [journalEntryTemplates, setJournalEntryTemplates] = useState(mockJournalEntryTemplates);
    const [fiscalYear, setFiscalYear] = useState(mockFiscalYear);
    const [supplierInvoices, setSupplierInvoices] = useState(mockSupplierInvoices);
    const [supplierPayments, setSupplierPayments] = useState(mockSupplierPayments);
    const [customerInvoices, setCustomerInvoices] = useState(mockInvoices);
    const [customerReceipts, setCustomerReceipts] = useState(mockCustomerReceipts);
    const [costCenters, setCostCenters] = useState(mockCostCenters);
    const [internalOrders, setInternalOrders] = useState(mockInternalOrders);
    const [standardCosts, setStandardCosts] = useState(mockStandardCosts);
    const [actualProductionData, setActualProductionData] = useState(mockActualProductionData);
    const [activities, setActivities] = useState(mockActivities);
    const [budgets, setBudgets] = useState(mockBudgets);
    const [taxRates, setTaxRates] = useState(mockTaxRates);
    const [currencies, setCurrencies] = useState(mockCurrencies);
    const [exchangeRates, setExchangeRates] = useState(mockExchangeRates);
    const [tafsiliGroups, setTafsiliGroups] = useState(mockTafsiliGroups);
    const [tafsiliAccounts, setTafsiliAccounts] = useState(mockTafsiliAccounts);
    
    // Treasury State
    const [checks, setChecks] = useState(mockChecks);
    const [treasuryDocs, setTreasuryDocs] = useState(mockTreasuryDocs);
    const [banks, setBanks] = useState(mockBanks);
    const [bankAccounts, setBankAccounts] = useState(mockBankAccounts);
    const [bankStatement, setBankStatement] = useState(mockBankStatement);
    const [cashDesks, setCashDesks] = useState(mockCashDesks);
    
    // Sales State
    const [parties, setParties] = useState(mockParties);
    const [quotes, setQuotes] = useState(mockQuotes);
    const [salesOrders, setSalesOrders] = useState(mockSalesOrders);
    const [deliveryNotes, setDeliveryNotes] = useState(mockDeliveryNotes);
    const [salesContracts, setSalesContracts] = useState(mockSalesContracts);
    const [opportunities, setOpportunities] = useState(mockOpportunities);
    const [supportTickets, setSupportTickets] = useState(mockSupportTickets);
    const [serviceContracts, setServiceContracts] = useState(mockServiceContracts);
    const [fieldServiceOrders, setFieldServiceOrders] = useState(mockFieldServiceOrders);
    const [posTerminals, setPosTerminals] = useState(mockPOSTerminals);
    const [posTransactions, setPosTransactions] = useState(mockPOSTransactions);
    const [posCloseouts, setPosCloseouts] = useState(mockPOSCloseouts);
    const [priceLists, setPriceLists] = useState(mockPriceLists);
    const [discountRules, setDiscountRules] = useState(mockDiscountRules);
    
    // Warehouse & Procurement State
    const [goods, setGoods] = useState(mockGoods);
    const [inventoryMovements, setInventoryMovements] = useState(mockInventoryMovements);
    const [purchaseRequests, setPurchaseRequests] = useState(mockPurchaseRequests);
    const [purchaseOrders, setPurchaseOrders] = useState(mockPurchaseOrders);
    const [goodsReceipts, setGoodsReceipts] = useState(mockGoodsReceipts);
    const [stocktakes, setStocktakes] = useState(mockStocktakes);
    const [rfqs, setRfqs] = useState(mockRFQs);
    const [purchaseContracts, setPurchaseContracts] = useState(mockPurchaseContracts);
    const [batches, setBatches] = useState(mockBatches);
    const [serialNumbers, setSerialNumbers] = useState(mockSerialNumbers);
    const [inspectionLots, setInspectionLots] = useState(mockInspectionLots);
    const [warehouseStructure, setWarehouseStructure] = useState(mockWarehouseStructure);
    const [warehouseStrategies, setWarehouseStrategies] = useState(mockWarehouseStrategies);

    // Asset Management State
    const [assets, setAssets] = useState(mockAssets);
    const [assetClasses, setAssetClasses] = useState(mockAssetClasses);
    const [assetTransactions, setAssetTransactions] = useState(mockAssetTransactions);
    
    // PM State
    const [maintenanceObjects, setMaintenanceObjects] = useState(mockMaintenanceObjects);
    const [maintenanceOrders, setMaintenanceOrders] = useState(mockMaintenanceOrders);
    const [preventivePlans, setPreventivePlans] = useState(mockPreventivePlans);
    
    // Production Planning State
    const [boms, setBoms] = useState(mockBOMs);
    const [workCenters, setWorkCenters] = useState(mockWorkCenters);
    const [routings, setRoutings] = useState(mockRoutings);
    const [productionOrders, setProductionOrders] = useState(mockProductionOrders);

    // Project System State
    const [projects, setProjects] = useState(mockProjects);
    const [wbs, setWbs] = useState(mockWBS);
    const [projectActivities, setProjectActivities] = useState(mockActivities_PS);
    const [timesheets, setTimesheets] = useState(mockTimesheets);
    const [projectBillings, setProjectBillings] = useState(mockProjectBillings);

    // Admin State
    const [roles, setRoles] = useState(mockRoles);
    const [users, setUsers] = useState(mockUsers);
    const [companyInfo, setCompanyInfo] = useState(mockCompanyInfo);

    // HCM State
    const [employees, setEmployees] = useState(mockEmployees);
    const [orgStructure, setOrgStructure] = useState(mockOrgStructure);
    const [payslips, setPayslips] = useState(mockPayslips);
    const [attendance, setAttendance] = useState(mockAttendance);
    const [jobOpenings, setJobOpenings] = useState(mockJobOpenings);
    const [candidates, setCandidates] = useState(mockCandidates);
    const [reviews, setReviews] = useState(mockReviews);
    const [trainings, setTrainings] = useState(mockTrainings);

    const saveButtonRef = useRef<HTMLButtonElement>(null);

    // BI State
    const [biWidgets, setBiWidgets] = useState<BIWidget[]>([
        { id: 'kpi1', component: 'KPIWidget', title: 'فروش کل', gridColumn: 'span 3', gridRow: 'span 1', props: { metric: 'totalSales' } },
        { id: 'kpi2', component: 'KPIWidget', title: 'تعداد فاکتورها', gridColumn: 'span 3', gridRow: 'span 1', props: { metric: 'invoiceCount' } },
        { id: 'kpi3', component: 'KPIWidget', title: 'میانگین فاکتور', gridColumn: 'span 3', gridRow: 'span 1', props: { metric: 'avgInvoice' } },
        { id: 'kpi4', component: 'KPIWidget', title: 'مطالبات معوق', gridColumn: 'span 3', gridRow: 'span 1', props: { metric: 'arOverdue' } },
        { id: 'chart1', component: 'SalesOverTimeWidget', title: 'روند فروش ماهانه', gridColumn: 'span 8', gridRow: 'span 2' },
        { id: 'list1', component: 'TopCustomersWidget', title: '۵ مشتری برتر', gridColumn: 'span 4', gridRow: 'span 2' },
        { id: 'chart2', component: 'AccountsReceivableAgingWidget', title: 'مرور سن بدهکاران', gridColumn: 'span 12', gridRow: 'span 2' },
    ]);

    // --- EFFECT HOOKS ---
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    // Responsive Sidebar: Close on mobile initial load
    useEffect(() => {
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    }, []);
    
    // Hotkey for saving journal entry
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'n' && activePage === 'financials-gl-list') {
                e.preventDefault();
                setActivePage('financials-gl-new');
            }
             if (e.ctrlKey && e.key === 's' && activePage === 'financials-gl-new') {
                e.preventDefault();
                saveButtonRef.current?.click();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activePage]);

    // --- HANDLER FUNCTIONS ---
    const showToast = useCallback((message: string, type: ToastData['type'] = 'success') => {
        const id = uuidv4();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
    }, []);
    
    const addJournalEntry = useCallback((entry: Omit<JournalEntry, 'id' | 'serialNumber'>) => {
        setJournalEntries(prev => {
            const maxSerial = prev.length > 0 ? Math.max(...prev.map(e => e.serialNumber)) : 1000;
            const newEntry = { ...entry, id: uuidv4(), serialNumber: maxSerial + 1 };
            return [newEntry, ...prev];
        });
    }, []);

    const addDeliveryNote = useCallback((deliveryData: Omit<DeliveryNote, 'id' | 'deliveryNumber'>) => {
        const newDeliveryNote: DeliveryNote = {
            ...deliveryData,
            id: uuidv4(),
            deliveryNumber: `DN-${deliveryNotes.length + 201}`,
        };
        setDeliveryNotes(prev => [newDeliveryNote, ...prev]);

        let stockUpdated = false;
        setGoods(prevGoods => {
            const newGoods = [...prevGoods];
            newDeliveryNote.lines.forEach(line => {
                const goodIndex = newGoods.findIndex(g => g.id === line.goodId);
                if (goodIndex > -1) {
                    newGoods[goodIndex].stock -= line.quantityShipped;
                    
                    const newMovement: InventoryMovement = {
                        id: uuidv4(),
                        date: newDeliveryNote.deliveryDate,
                        goodId: line.goodId,
                        goodName: line.goodName,
                        quantity: -line.quantityShipped,
                        type: 'خروج',
                        referenceDocId: newDeliveryNote.id,
                        referenceDocNumber: `خروج ${newDeliveryNote.deliveryNumber}`,
                    };
                    setInventoryMovements(prev => [newMovement, ...prev]);
                    stockUpdated = true;
                }
            });
            return newGoods;
        });

        if (stockUpdated) {
            showToast(`حواله خروج ${newDeliveryNote.deliveryNumber} ثبت و موجودی انبار به‌روز شد.`);
        } else {
            showToast(`حواله خروج ${newDeliveryNote.deliveryNumber} ثبت شد.`);
        }
    }, [deliveryNotes.length, showToast]);
    
    // --- MASTER DATA HANDLERS ---
    const addParty = useCallback((partyData: Omit<Party, 'id'>) => {
        const newParty = { ...partyData, id: uuidv4() };
        setParties(prev => [...prev, newParty]);
        showToast('طرف حساب جدید با موفقیت ایجاد شد.');
    }, [showToast]);

    const updateParty = useCallback((updatedParty: Party) => {
        setParties(prev => prev.map(p => p.id === updatedParty.id ? updatedParty : p));
        showToast('اطلاعات طرف حساب با موفقیت ویرایش شد.');
    }, [showToast]);

    const deleteParty = useCallback((id: string) => {
        setParties(prev => prev.filter(p => p.id !== id));
        showToast('طرف حساب حذف شد.', 'info');
    }, [showToast]);

    const addGood = useCallback((goodData: Omit<Good, 'id'>) => {
        const newGood = { ...goodData, id: uuidv4(), inventoryAccountCode: '1105', cogsAccountCode: '5101' }; // Default accounts
        setGoods(prev => [...prev, newGood]);
        showToast('کالای جدید با موفقیت ایجاد شد.');
    }, [showToast]);

    const updateGood = useCallback((updatedGood: Good) => {
        setGoods(prev => prev.map(g => g.id === updatedGood.id ? updatedGood : g));
        showToast('اطلاعات کالا با موفقیت ویرایش شد.');
    }, [showToast]);
    
    const deleteGood = useCallback((id: string) => {
        setGoods(prev => prev.filter(g => g.id !== id));
        showToast('کالا حذف شد.', 'info');
    }, [showToast]);
    
    const onSaveBank = (bankData: Omit<Bank, 'id'> | Bank) => {
        if ('id' in bankData) {
            setBanks(prev => prev.map(b => b.id === bankData.id ? bankData : b));
            showToast('بانک ویرایش شد.');
        } else {
            setBanks(prev => [...prev, { id: uuidv4(), ...bankData }]);
            showToast('بانک جدید ایجاد شد.');
        }
    };
    
    const addBankAccount = useCallback((accountData: Omit<BankAccount, 'id'>) => {
        const newAccount = { ...accountData, id: uuidv4() };
        setBankAccounts(prev => [...prev, newAccount]);
    }, []);

    const updateBankAccount = useCallback((updatedAccount: BankAccount) => {
        setBankAccounts(prev => prev.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc));
    }, []);

    const deleteBankAccount = useCallback((id: string) => {
        setBankAccounts(prev => prev.filter(acc => acc.id !== id));
    }, []);
    
    const addCashDesk = (desk: Omit<CashDesk, 'id'>) => setCashDesks(prev => [...prev, { ...desk, id: uuidv4() }]);
    const updateCashDesk = (desk: CashDesk) => setCashDesks(prev => prev.map(d => d.id === desk.id ? desk : d));
    const deleteCashDesk = (id: string) => setCashDesks(prev => prev.filter(d => d.id !== id));
    
    const onSaveAssetClass = (classData: Omit<AssetClass, 'id'> | AssetClass) => {
        if ('id' in classData) {
            setAssetClasses(prev => prev.map(ac => ac.id === classData.id ? classData : ac));
            showToast('کلاس دارایی ویرایش شد.');
        } else {
            setAssetClasses(prev => [...prev, { id: uuidv4(), ...classData }]);
            showToast('کلاس دارایی جدید ایجاد شد.');
        }
    };

    // --- ASSET MANAGEMENT HANDLERS ---
    const onSaveAsset = (assetData: Omit<FixedAsset, 'id'> | FixedAsset) => {
        if ('id' in assetData) { // Update
            setAssets(prev => prev.map(a => a.id === assetData.id ? assetData as FixedAsset : a));
            showToast('دارایی با موفقیت ویرایش شد.');
        } else { // Add
            const newAsset: FixedAsset = { ...assetData, id: uuidv4(), status: 'Active' };
            setAssets(prev => [newAsset, ...prev]);
            
            // Auto-create acquisition transaction
            const newTransaction: AssetTransaction = {
                id: uuidv4(),
                assetId: newAsset.id,
                assetDescription: newAsset.description,
                type: 'Acquisition',
                date: new Date(newAsset.acquisitionDate).toLocaleDateString('fa-IR-u-nu-latn'),
                amount: newAsset.acquisitionCost,
            };
            setAssetTransactions(prev => [newTransaction, ...prev]);

            showToast('دارایی جدید ایجاد و سند تملک آن ثبت شد.');
        }
    };
    
    const onDeleteAsset = (id: string) => {
        setAssets(prev => prev.filter(a => a.id !== id));
        showToast('دارایی حذف شد.', 'info');
    };

    const onSaveAssetTransaction = (txData: Omit<AssetTransaction, 'id'>) => {
        const newTx: AssetTransaction = { ...txData, id: uuidv4() };
        setAssetTransactions(prev => [newTx, ...prev]);

        if (txData.type === 'Sale' || txData.type === 'Disposal') {
            const status: 'Sold' | 'Scrapped' = txData.type === 'Sale' ? 'Sold' : 'Scrapped';
            setAssets(prev => prev.map(a => a.id === txData.assetId ? { ...a, status } : a));
        }
        showToast(`عملیات ${txData.type} برای دارایی ثبت شد.`);
    };
    
    // --- PM HANDLERS ---
    const onSaveMaintenanceObject = (objData: Omit<MaintenanceObject, 'id'> | MaintenanceObject) => {
        if ('id' in objData) {
            setMaintenanceObjects(prev => prev.map(o => o.id === objData.id ? objData as MaintenanceObject : o));
            showToast('تجهیز ویرایش شد.');
        } else {
            setMaintenanceObjects(prev => [{ ...objData, id: uuidv4() }, ...prev]);
            showToast('تجهیز جدید ایجاد شد.');
        }
    };

    const onSaveMaintenanceOrder = (orderData: Omit<MaintenanceOrder, 'id' | 'orderNumber' | 'status' | 'creationDate'>) => {
         const maxNum = maintenanceOrders.length > 0 ? Math.max(...maintenanceOrders.map(o => o.orderNumber)) : 8000;
         const newOrder: MaintenanceOrder = { ...orderData, id: uuidv4(), orderNumber: maxNum + 1, status: 'Open', creationDate: formatDate(new Date()) };
         setMaintenanceOrders(prev => [newOrder, ...prev]);
         showToast('دستور کار جدید ایجاد شد.');
    };

    const onSavePreventivePlan = (planData: Omit<PreventivePlan, 'id'>) => {
        const newPlan: PreventivePlan = { ...planData, id: uuidv4() };
        setPreventivePlans(prev => [newPlan, ...prev]);
        showToast('برنامه نگهداری جدید ایجاد شد.');
    };


    // MM Handlers
    const addPurchaseRequest = useCallback((requestData: Omit<PurchaseRequest, 'id' | 'requestNumber'>) => {
        setPurchaseRequests(prev => {
            const maxNum = prev.length > 0 ? Math.max(...prev.map(pr => pr.requestNumber)) : 3000;
            const newRequest = { ...requestData, id: uuidv4(), requestNumber: maxNum + 1 };
            return [newRequest, ...prev];
        });
        showToast('درخواست خرید جدید ثبت شد.');
    }, [showToast]);
    
    const addPurchaseOrder = useCallback((orderData: Omit<PurchaseOrder, 'id' | 'poNumber'>) => {
        setPurchaseOrders(prev => {
            const maxNum = prev.length > 0 ? Math.max(...prev.map(po => po.poNumber)) : 4000;
            const newOrder = { ...orderData, id: uuidv4(), poNumber: maxNum + 1 };
            
            showToast(`سفارش خرید ${newOrder.poNumber} ایجاد شد.`);

            if (orderData.purchaseRequestId) {
                setPurchaseRequests(prevPRs => prevPRs.map(pr => 
                    pr.id === orderData.purchaseRequestId ? { ...pr, status: 'سفارش داده شده' } : pr
                ));
            }
            return [newOrder, ...prev];
        });
    }, [showToast]);
    
    const addGoodsReceipt = useCallback((receiptData: Omit<GoodsReceipt, 'id' | 'receiptNumber'>) => {
        const newReceipt = { ...receiptData, id: uuidv4(), receiptNumber: (goodsReceipts.length > 0 ? Math.max(...goodsReceipts.map(gr => gr.receiptNumber)) : 5000) + 1 };
        
        setGoodsReceipts(prev => [newReceipt, ...prev]);
        
        setGoods(prevGoods => {
            const newGoods = [...prevGoods];
            newReceipt.lines.forEach(line => {
                const goodIndex = newGoods.findIndex(g => g.id === line.goodId);
                if (goodIndex > -1) {
                    newGoods[goodIndex].stock += line.quantityReceived;
                    const newMovement: InventoryMovement = {
                        id: uuidv4(),
                        date: newReceipt.receiptDate,
                        goodId: line.goodId,
                        goodName: line.goodName,
                        quantity: line.quantityReceived,
                        type: 'ورود',
                        referenceDocId: newReceipt.id,
                        referenceDocNumber: `رسید ${newReceipt.receiptNumber}`,
                    };
                    setInventoryMovements(prev => [newMovement, ...prev]);
                }
            });
            return newGoods;
        });
        
        setPurchaseOrders(prevPOs => {
            const po = prevPOs.find(p => p.id === newReceipt.purchaseOrderId);
            if (!po) return prevPOs;

            const allReceiptsForPo = [...goodsReceipts, newReceipt].filter(gr => gr.purchaseOrderId === po.id);
            
            const allLinesFulfilled = po.lines.every(poLine => {
                const totalReceived = allReceiptsForPo.reduce((sum, gr) => {
                    const grLine = gr.lines.find(l => l.goodId === poLine.goodId);
                    return sum + (grLine?.quantityReceived || 0);
                }, 0);
                return totalReceived >= poLine.quantity;
            });

            const newStatus = allLinesFulfilled ? 'دریافت کامل' : 'دریافت قسمتی';
            
            return prevPOs.map(p => p.id === po.id ? { ...p, status: newStatus } : p);
        });

        showToast(`رسید ${newReceipt.receiptNumber} ثبت و موجودی انبار به‌روز شد.`);
    }, [goodsReceipts, showToast]);

    const addStocktake = useCallback((stocktakeData: Omit<Stocktake, 'id' | 'documentNumber'>) => {
        const maxNum = stocktakes.length > 0 ? Math.max(...stocktakes.map(st => st.documentNumber)) : 6000;
        const newStocktake = { ...stocktakeData, id: uuidv4(), documentNumber: maxNum + 1 };
        setStocktakes(prev => [newStocktake, ...prev]);
    }, [stocktakes]);

    const postStocktake = useCallback((id: string, lines: Stocktake['lines']) => {
        const adjustments: { good: Good, diff: number }[] = [];
        
        setGoods(prevGoods => {
            const newGoods = [...prevGoods];
            lines.forEach(line => {
                if (line.countedQuantity !== null) {
                    const diff = line.countedQuantity - line.bookQuantity;
                    if (diff !== 0) {
                        const goodIndex = newGoods.findIndex(g => g.id === line.goodId);
                        if (goodIndex > -1) {
                            newGoods[goodIndex].stock += diff;
                            adjustments.push({ good: newGoods[goodIndex], diff });
                        }
                    }
                }
            });
            return newGoods;
        });

        setStocktakes(prev => prev.map(st => st.id === id ? { ...st, status: 'ثبت شده' } : st));
        
        if (adjustments.length > 0) {
            let totalAdjustmentValue = 0;
            const journalLines: Omit<JournalEntry['lines'][0], 'id'>[] = [];
            
            adjustments.forEach(({ good, diff }) => {
                const movementType = diff > 0 ? 'ورود' : 'خروج';
                const movement: InventoryMovement = {
                    id: uuidv4(),
                    date: formatDate(new Date()),
                    goodId: good.id,
                    goodName: good.name,
                    quantity: diff,
                    type: movementType,
                    referenceDocId: id,
                    referenceDocNumber: `انبارگردانی ${stocktakes.find(st=>st.id === id)?.documentNumber}`
                };
                setInventoryMovements(prev => [movement, ...prev]);
                
                const adjustmentValue = diff * good.purchasePrice;
                totalAdjustmentValue += adjustmentValue;
                
                journalLines.push({
                    accountCode: good.inventoryAccountCode,
                    accountName: 'موجودی کالا',
                    description: `مغایرت انبارگردانی - ${good.name}`,
                    debit: adjustmentValue > 0 ? adjustmentValue : 0,
                    credit: adjustmentValue < 0 ? -adjustmentValue : 0,
                });
            });
            
            journalLines.push({
                accountCode: '5204',
                accountName: 'کسری و اضافات',
                description: 'مغایرت انبارگردانی',
                debit: totalAdjustmentValue < 0 ? -totalAdjustmentValue : 0,
                credit: totalAdjustmentValue > 0 ? totalAdjustmentValue : 0,
            });

            addJournalEntry({
                docNumber: 0, 
                date: formatDate(new Date()),
                description: `سند مغایرت انبارگردانی شماره ${stocktakes.find(st=>st.id === id)?.documentNumber}`,
                status: 'ثبت شده',
                sourceModule: 'Inventory',
                lines: journalLines.map(l => ({...l, id: uuidv4()})),
                totalDebit: Math.abs(totalAdjustmentValue),
                totalCredit: Math.abs(totalAdjustmentValue),
            });
        }
        
        showToast('مغایرت انبارگردانی ثبت و موجودی و اسناد به‌روزرسانی شدند.');
    }, [addJournalEntry, goods, showToast, stocktakes]);

    // PP Handlers
    const onSaveBOM = useCallback((updatedBOM: BOM) => {
        setBoms(prev => prev.map(b => b.id === updatedBOM.id ? updatedBOM : b));
        showToast('فرمول ساخت به‌روزرسانی شد.');
    }, [showToast]);

    const onSaveWorkCenter = useCallback((wc: WorkCenter) => {
         setWorkCenters(prev => {
            if (prev.find(w => w.id === wc.id)) {
                showToast('مرکز کاری ویرایش شد.');
                return prev.map(w => w.id === wc.id ? wc : w);
            } else {
                 showToast('مرکز کاری جدید ایجاد شد.');
                return [...prev, wc];
            }
        });
    }, [showToast]);
    
    const onSaveRouting = useCallback((updatedRouting: Routing) => {
        setRoutings(prev => {
            if (prev.find(r => r.id === updatedRouting.id)) {
                showToast('مسیر تولید ویرایش شد.');
                return prev.map(r => r.id === updatedRouting.id ? updatedRouting : r);
            } else {
                 showToast('مسیر تولید جدید ایجاد شد.');
                return [...prev, updatedRouting];
            }
        });
    }, [showToast]);

    const addProductionOrder = useCallback((orderData: Omit<ProductionOrder, 'id' | 'orderNumber' | 'status'>) => {
        const maxNum = productionOrders.length > 0 ? Math.max(...productionOrders.map(p => p.orderNumber)) : 5000;
        const newOrder: ProductionOrder = {
            ...orderData,
            id: uuidv4(),
            orderNumber: maxNum + 1,
            status: 'ایجاد شده',
            actualCosts: { material: 0, labor: 0, overhead: 0 }
        };

        const bom = boms.find(b => b.id === newOrder.bomId);
        let materialStdCost = 0;
        if(bom) {
            materialStdCost = bom.items.reduce((sum, item) => {
                const component = goods.find(g => g.id === item.componentId);
                return sum + (item.quantity * (component?.purchasePrice || 0));
            }, 0);
        }
        newOrder.standardCosts = { material: materialStdCost * newOrder.quantity, labor: 0, overhead: 0 };
        
        setProductionOrders(prev => [newOrder, ...prev]);
        showToast(`دستور تولید ${newOrder.orderNumber} ایجاد شد.`);
    }, [showToast, productionOrders, boms, goods]);

    const updateProductionOrder = useCallback((orderId: string, action: 'release' | 'issue_material' | 'confirm_production', data?: any) => {
        setProductionOrders(prev => prev.map(order => {
            if (order.id !== orderId) return order;
            
            let updatedOrder = { ...order };
            
            if (action === 'release' && order.status === 'ایجاد شده') {
                updatedOrder.status = 'آزاد شده';
                showToast(`دستور تولید ${order.orderNumber} آزاد شد.`);
            } else if (action === 'issue_material' && order.status === 'آزاد شده') {
                updatedOrder.actualCosts = { 
                    material: (updatedOrder.actualCosts?.material || 0) + data.materialCost,
                    labor: updatedOrder.actualCosts?.labor || 0,
                    overhead: updatedOrder.actualCosts?.overhead || 0
                };
                showToast(`مصرف مواد برای دستور ${order.orderNumber} ثبت شد.`);
            } else if (action === 'confirm_production' && (order.status === 'آزاد شده' || order.status === 'در حال تولید')) {
                updatedOrder.status = 'تایید شده';
                updatedOrder.actualCosts = { 
                    material: updatedOrder.actualCosts?.material || 0,
                    labor: (updatedOrder.actualCosts?.labor || 0) + data.laborCost,
                    overhead: updatedOrder.actualCosts?.overhead || 0,
                };
                showToast(`تولید ${data.producedQty} عدد از محصول برای دستور ${order.orderNumber} تایید شد.`);

                setGoods(gds => gds.map(g => g.id === order.goodId ? { ...g, stock: g.stock + data.producedQty } : g));
            }
            
            return updatedOrder;
        }));
    }, [showToast]);

    const runMRP = (demands: MRPDemand[]): MRPResult[] => {
        const results: MRPResult[] = [];
        demands.forEach(demand => {
            const bom = boms.find(b => b.goodId === demand.goodId);
            if(bom) {
                bom.items.forEach(item => {
                    const requiredQty = item.quantity * demand.quantity;
                    const component = goods.find(g => g.id === item.componentId);
                    if(component && component.stock < requiredQty) {
                         results.push({
                            type: component.type === 'Raw Material' ? 'Purchase Requisition' : 'Production Order',
                            goodId: component.id,
                            goodName: component.name,
                            quantity: requiredQty - component.stock,
                            requiredDate: demand.dueDate,
                        });
                    }
                })
            }
        });
        showToast(`MRP اجرا شد و ${results.length} پیشنهاد ایجاد گردید.`);
        return results;
    }
    
    const convertMRPResult = (result: MRPResult) => {
        if(result.type === 'Purchase Requisition') {
            const newPR = {
                requester: 'MRP Runner',
                requestDate: formatDate(new Date()),
                status: 'تایید شده' as PurchaseRequestStatus,
                lines: [{
                    id: uuidv4(),
                    goodId: result.goodId,
                    goodName: result.goodName,
                    quantity: result.quantity,
                    requiredDate: result.requiredDate
                }]
            };
            addPurchaseRequest(newPR);
            showToast(`پیشنهاد MRP به درخواست خرید تبدیل شد.`);
        } else {
            showToast(`پیشنهاد MRP به دستور تولید تبدیل شد.`);
        }
    }

    // Admin Handlers
    const addUser = useCallback((userData: Omit<User, 'id'>) => {
        const newUser = { ...userData, id: uuidv4() };
        setUsers(prev => [...prev, newUser]);
        showToast('کاربر جدید با موفقیت ایجاد شد.');
    }, [showToast]);

    const updateUser = useCallback((updatedUser: User) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        showToast('اطلاعات کاربر با موفقیت ویرایش شد.');
    }, [showToast]);
    
    const updateCompanyInfo = useCallback((info: CompanyInfo) => {
        setCompanyInfo(info);
        showToast('اطلاعات شرکت با موفقیت به‌روزرسانی شد.');
    }, [showToast]);

    // --- HCM HANDLERS ---
    const onSaveEmployee = (employeeData: Employee | Omit<Employee, 'id'>) => {
        if ('id' in employeeData) {
            setEmployees(prev => prev.map(e => e.id === employeeData.id ? employeeData as Employee : e));
        } else {
            setEmployees(prev => [...prev, { ...employeeData, id: uuidv4() }]);
        }
    };
    
    const PERSIAN_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

    const onRunPayroll = (period: { year: number, month: number }) => {
        // Mock payroll run logic
        const newPayslips: Payslip[] = employees.filter(e => e.status === 'فعال').map(e => ({
            id: uuidv4(),
            employeeId: e.employeeId,
            period: `${PERSIAN_MONTHS[period.month]} ${period.year}`,
            grossSalary: 80000000,
            deductions: 15000000,
            netSalary: 65000000
        }));
        setPayslips(prev => [...prev, ...newPayslips]);
    };
     const onUpdateCandidate = (updatedCandidate: Candidate) => {
        setCandidates(prev => prev.map(c => c.id === updatedCandidate.id ? updatedCandidate : c));
    };

    // --- AR/AP Handlers ---
    const addCustomerReceipt = useCallback((receipt: Omit<CustomerReceipt, 'id' | 'receiptNumber'>) => {
        const maxNum = customerReceipts.length > 0 ? Math.max(...customerReceipts.map(r => r.receiptNumber)) : 200;
        const newReceipt: CustomerReceipt = { ...receipt, id: uuidv4(), receiptNumber: maxNum + 1 };
        
        setCustomerReceipts(prev => [newReceipt, ...prev]);

        setCustomerInvoices(prevInvoices => {
            const newInvoices = [...prevInvoices];
            newReceipt.appliedInvoices.forEach(applied => {
                const invIndex = newInvoices.findIndex(inv => inv.id === applied.invoiceId);
                if (invIndex > -1) {
                    const inv = { ...newInvoices[invIndex] };
                    inv.paidAmount += applied.amount;
                    if (inv.paidAmount >= inv.total) {
                        inv.status = 'پرداخت شده';
                    } else {
                        inv.status = 'پرداخت قسمتی';
                    }
                    newInvoices[invIndex] = inv;
                }
            });
            return newInvoices;
        });

        showToast('رسید مشتری با موفقیت ثبت شد.');
    }, [customerReceipts.length, showToast]);

    const deleteCustomerReceipt = useCallback((id: string) => {
        const receiptToDelete = customerReceipts.find(r => r.id === id);
        if (!receiptToDelete) return;

        setCustomerInvoices(prevInvoices => {
            const newInvoices = [...prevInvoices];
            receiptToDelete.appliedInvoices.forEach(applied => {
                const invIndex = newInvoices.findIndex(inv => inv.id === applied.invoiceId);
                if (invIndex > -1) {
                    const inv = { ...newInvoices[invIndex] };
                    inv.paidAmount -= applied.amount;
                    // Re-evaluate status
                    if (inv.paidAmount <= 0) {
                        inv.paidAmount = 0;
                        inv.status = 'ثبت نهایی'; 
                    } else {
                        inv.status = 'پرداخت قسمتی';
                    }
                    newInvoices[invIndex] = inv;
                }
            });
            return newInvoices;
        });
        
        setCustomerReceipts(prev => prev.filter(r => r.id !== id));
        showToast('رسید مشتری حذف و مبالغ به فاکتورها بازگردانده شد.', 'info');
    }, [customerReceipts, showToast]);
    
    const addSupplierPayment = useCallback((payment: Omit<SupplierPayment, 'id' | 'paymentNumber'>) => {
        const maxNum = supplierPayments.length > 0 ? Math.max(...supplierPayments.map(p => p.paymentNumber)) : 100;
        const newPayment: SupplierPayment = { ...payment, id: uuidv4(), paymentNumber: maxNum + 1 };
        
        setSupplierPayments(prev => [newPayment, ...prev]);

        setSupplierInvoices(prevInvoices => {
            const newInvoices = [...prevInvoices];
            newPayment.appliedInvoices.forEach(applied => {
                const invIndex = newInvoices.findIndex(inv => inv.id === applied.invoiceId);
                if (invIndex > -1) {
                    const inv = { ...newInvoices[invIndex] };
                    inv.paidAmount += applied.amount;
                    if (inv.paidAmount >= inv.totalAmount) {
                        inv.status = 'پرداخت شده';
                    } else {
                        inv.status = 'پرداخت قسمتی';
                    }
                    newInvoices[invIndex] = inv;
                }
            });
            return newInvoices;
        });

        showToast('پرداخت به تامین‌کننده با موفقیت ثبت شد.');
    }, [supplierPayments.length, showToast]);

    const deleteSupplierPayment = useCallback((id: string) => {
        const paymentToDelete = supplierPayments.find(p => p.id === id);
        if (!paymentToDelete) return;

        setSupplierInvoices(prevInvoices => {
            const newInvoices = [...prevInvoices];
            paymentToDelete.appliedInvoices.forEach(applied => {
                const invIndex = newInvoices.findIndex(inv => inv.id === applied.invoiceId);
                if (invIndex > -1) {
                    const inv = { ...newInvoices[invIndex] };
                    inv.paidAmount -= applied.amount;
                    if (inv.paidAmount <= 0) {
                        inv.paidAmount = 0;
                        inv.status = 'ثبت شده';
                    } else {
                        inv.status = 'پرداخت قسمتی';
                    }
                    newInvoices[invIndex] = inv;
                }
            });
            return newInvoices;
        });

        setSupplierPayments(prev => prev.filter(p => p.id !== id));
        showToast('پرداخت حذف و مبالغ به فاکتورها بازگردانده شد.', 'info');
    }, [supplierPayments, showToast]);

    // --- Helper to generate breadcrumbs and page title ---
    const getPageInfo = useCallback((slug: string) => {
        const findPage = (items: any[]): { label: string, parents: string[] } | null => {
            for(const item of items) {
                if (item.path === slug) return { label: item.label, parents: [] };
                if (item.children) {
                    const found = findPage(item.children);
                    if (found) return { label: found.label, parents: [item.label, ...found.parents] };
                }
            }
            return null;
        };

        // Search across all groups
        for(const group of navGroups) {
             const found = findPage(group.items);
             if (found) return found;
        }
        return { label: 'صفحه', parents: [] }; 
    }, []);

    const breadcrumbs = useMemo(() => {
         const info = getPageInfo(activePage);
         const crumbs: { label: string; path?: string }[] = info.parents.map(label => ({ label }));
         crumbs.push({ label: info.label });
         // Prepend dashboard
         if (activePage !== 'dashboard') {
             crumbs.unshift({ label: 'داشبورد', path: 'dashboard' });
         }
         return crumbs;
    }, [activePage, getPageInfo]);

    const pageTitle = useMemo(() => {
        return getPageInfo(activePage).label;
    }, [activePage, getPageInfo]);


    // --- RENDER LOGIC ---
    const renderPage = () => {
        switch (activePage) {
            case 'dashboard': return <DashboardPage journalEntries={journalEntries} checks={checks} treasuryDocs={treasuryDocs} onNavigate={setActivePage} accounts={accounts} customerInvoices={customerInvoices} supplierInvoices={supplierInvoices} />;
            // GL
            case 'financials-gl-list': return <JournalEntriesListPage journalEntries={journalEntries} onNavigate={setActivePage} deleteJournalEntry={() => {}} reverseJournalEntry={()=>{}} />;
            case 'financials-gl-new': return <NewJournalEntryPage onNavigate={setActivePage} addJournalEntry={addJournalEntry} nextSerialNumber={journalEntries.length + 1001} showToast={showToast} accounts={accounts} templates={journalEntryTemplates} tafsiliGroups={tafsiliGroups} tafsiliAccounts={tafsiliAccounts} saveButtonRef={saveButtonRef} />;
            case 'financials-gl-recurring': return <RecurringEntriesPage recurringEntries={recurringEntries} onRunEntries={() => {}} setRecurringEntries={setRecurringEntries} accounts={accounts} showToast={showToast} />;
            case 'financials-gl-templates': return <JournalEntryTemplatesPage templates={journalEntryTemplates} addTemplate={() => {}} updateTemplate={()=>{}} deleteTemplate={()=>{}} accounts={accounts} />;
            case 'financials-gl-closing': return <YearEndClosingPage fiscalYear={fiscalYear} updateFiscalYear={(u) => setFiscalYear(f => ({...f, ...u}))} showToast={showToast} accounts={accounts} addJournalEntry={addJournalEntry} />;
             case 'financials-convert-docs': return <ConvertDocumentsPage onNavigate={setActivePage} addJournalEntry={addJournalEntry} showToast={showToast} journalEntries={journalEntries} />;
            // AP
            case 'financials-ap-invoices': return <SupplierInvoicesListPage invoices={supplierInvoices} parties={parties} goods={goods} addInvoice={()=>{}} updateInvoice={()=>{}} deleteInvoice={()=>{}} showToast={showToast}/>;
            case 'financials-ap-payments': return <SupplierPaymentsPage payments={supplierPayments} invoices={supplierInvoices} parties={parties} addPayment={addSupplierPayment} deletePayment={deleteSupplierPayment} showToast={showToast} />;
            case 'financials-ap-aging': return <APRAgingReportPage invoices={supplierInvoices} />;
            // AR
            case 'financials-ar-invoices': return <CustomerInvoicesListPage invoices={customerInvoices} parties={parties} onNavigate={setActivePage} postInvoice={()=>{}}/>;
            case 'financials-ar-receipts': return <CustomerReceiptsPage receipts={customerReceipts} invoices={customerInvoices} parties={parties} addReceipt={addCustomerReceipt} deleteReceipt={deleteCustomerReceipt} showToast={showToast} />;
            case 'financials-ar-dunning': return <DunningReportPage invoices={customerInvoices} />;
             // Costing
            case 'financials-cost-allocation': return <CostAllocationPage costCenters={costCenters} addJournalEntry={addJournalEntry} showToast={showToast} />;
            case 'financials-cost-report': return <CostCenterReportPage costCenters={costCenters} />;
            case 'financials-cost-standard': return <StandardCostingPage goods={goods} standardCosts={standardCosts} actualData={actualProductionData} setActualData={setActualProductionData} />;
            case 'financials-cost-abc': return <ActivityBasedCostingPage activities={activities} setActivities={setActivities} goods={goods} />;
            case 'financials-cost-internal-orders': return <InternalOrdersPage internalOrders={internalOrders} addInternalOrder={()=>{}} updateInternalOrder={()=>{}} deleteInternalOrder={()=>{}} showToast={showToast} />;
            // Budget
            case 'financials-budget-define': return <DefineBudgetPage budgets={budgets} accounts={accounts} costCenters={costCenters} onSaveBudget={()=>{}} />;
            case 'financials-budget-actuals': return <BudgetActualsReportPage budgets={budgets} accounts={accounts} costCenters={costCenters} journalEntries={journalEntries} />;
            // Reports
            case 'financials-reports-standard': return <StandardReportsPage accounts={accounts} journalEntries={journalEntries} />;
            case 'financials-reports-statements': return <FinancialStatementsPage accounts={accounts} journalEntries={journalEntries} />;
            case 'financials-reports-consolidation': return <ConsolidationPage />;
            case 'financials-reports-builder': return <ReportBuilderPage />;
            // Setup
            case 'financials-setup-tax': return <TaxSettingsPage taxRates={taxRates} setTaxRates={setTaxRates} showToast={showToast} />;
            case 'financials-setup-currency': return <CurrencySettingsPage currencies={currencies} exchangeRates={exchangeRates} setExchangeRates={setExchangeRates} showToast={showToast} />;
            // Treasury
            case 'treasury-dashboard': return <TreasuryDashboardPage treasuryDocs={treasuryDocs} bankAccounts={bankAccounts} cashDesks={cashDesks} checks={checks} onNavigate={setActivePage} />;
            case 'treasury-receive': return <NewReceiptPage onNavigate={setActivePage} addTreasuryDoc={() => {}} showToast={showToast} bankAccounts={bankAccounts} cashDesks={cashDesks} parties={parties} />;
            case 'treasury-payment': return <NewPaymentPage onNavigate={setActivePage} addTreasuryDoc={() => {}} showToast={showToast} bankAccounts={bankAccounts} cashDesks={cashDesks} parties={parties} />;
            case 'treasury-cash-checks': return <BankOperationsPage checks={checks} onNavigate={setActivePage} deleteCheck={() => {}} updateCheckStatus={() => {}} />;
            case 'treasury-new-check': return <NewCheckPage onNavigate={setActivePage} addCheck={() => {}} showToast={showToast} />;
            case 'treasury-bank-reconciliation': return <BankReconciliationPage bankAccounts={bankAccounts} treasuryDocs={treasuryDocs} checks={checks} bankStatement={bankStatement} onReconcile={()=>{}} showToast={showToast} />;
            case 'treasury-liquidity-forecast': return <CashFlowForecastPage invoices={customerInvoices} supplierInvoices={supplierInvoices} checks={checks} bankAccounts={bankAccounts} />;
            // Sales
            case 'sales-ops-billing': return <NewInvoicePage onNavigate={setActivePage} addInvoice={()=>{}} showToast={showToast} parties={parties} goods={goods} priceLists={priceLists} discountRules={discountRules} />;
            case 'sales-ops-quote': return <NewQuotePage onNavigate={setActivePage} addQuote={()=>{}} showToast={showToast} parties={parties} goods={goods} />;
            case 'sales-ops-order': return <NewOrderPage onNavigate={setActivePage} addSalesOrder={()=>{}} showToast={showToast} parties={parties} goods={goods} quotes={quotes} />;
            case 'sales-ops-delivery': return <NewDeliveryPage onNavigate={setActivePage} addDeliveryNote={addDeliveryNote} showToast={showToast} salesOrders={salesOrders} goods={goods} />;
            case 'sales-ops-contracts': return <SalesContractsPage onNavigate={setActivePage} addSalesContract={()=>{}} showToast={showToast} parties={parties} salesContracts={salesContracts} />;
            case 'sales-analytics-dashboard': return <SalesAnalyticsDashboardPage invoices={customerInvoices} goods={goods} parties={parties} />;
            case 'sales-crm-opportunities': return <OpportunitiesPage opportunities={opportunities} onUpdateOpportunity={()=>{}} onAddOpportunity={()=>{}} parties={parties} showToast={showToast} />;
            case 'sales-crm-service-tickets': return <SupportTicketsPage tickets={supportTickets} parties={parties} onUpdateTicket={()=>{}} onAddTicket={()=>{}} onAddReply={()=>{}} showToast={showToast} />;
            case 'sales-crm-service-contracts': return <ServiceContractsListPage contracts={serviceContracts} parties={parties} onAddContract={()=>{}} onUpdateContract={()=>{}} showToast={showToast} />;
            case 'sales-crm-field-service': return <FieldServicePage serviceOrders={fieldServiceOrders} parties={parties} tickets={supportTickets} onAddOrder={()=>{}} onUpdateOrder={()=>{}} showToast={showToast} />;
            case 'sales-pos-terminals': return <POSTerminalsPage terminals={posTerminals} setTerminals={setPosTerminals} showToast={showToast} />;
            case 'sales-pos-closing': return <POSClosingPage terminals={posTerminals} transactions={posTransactions} onRunCloseout={()=>{}} showToast={showToast} />;
            case 'sales-pricing-lists': return <PriceListsPage priceLists={priceLists} onUpdatePriceList={()=>{}} goods={goods} showToast={showToast} />;
            case 'sales-pricing-discounts': return <DiscountsPage discountRules={discountRules} onAddDiscountRule={()=>{}} onUpdateDiscountRule={()=>{}} onDeleteDiscountRule={()=>{}} goods={goods} parties={parties} showToast={showToast} />;
            case 'sales-pricing-procedure': return <PricingProcedurePage procedure={mockPricingProcedure} />;
            case 'sales-pricing-analysis': return <PriceAnalysisPage procedure={mockPricingProcedure} priceLists={priceLists} discountRules={discountRules} parties={parties} goods={goods} />;
            // Warehouse & Procurement
            case 'inventory-movements': return <InventoryMovementsPage movements={inventoryMovements} />;
            case 'procurement-analytics-dashboard': return <ProcurementAnalyticsDashboardPage purchaseOrders={purchaseOrders} suppliers={parties} goods={goods} />;
            case 'procurement-req': return <PurchaseRequestPage purchaseRequests={purchaseRequests} goods={goods} onAddRequest={addPurchaseRequest} showToast={showToast} />;
            case 'procurement-po': return <PurchaseOrderPage purchaseOrders={purchaseOrders} purchaseRequests={purchaseRequests} suppliers={parties.filter(p => p.code.startsWith('2'))} goods={goods} onAddOrder={addPurchaseOrder} showToast={showToast} />;
            case 'procurement-receipt': return <GoodsReceiptPage goodsReceipts={goodsReceipts} purchaseOrders={purchaseOrders} goods={goods} onAddReceipt={addGoodsReceipt} showToast={showToast} />;
            case 'inventory-stocktaking': return <InventoryStocktakingPage stocktakes={stocktakes} goods={goods} onAddStocktake={addStocktake} onPostStocktake={postStocktake} showToast={showToast} />;
            case 'procurement-rfq': return <RFQPage rfqs={rfqs} purchaseRequests={purchaseRequests} suppliers={parties} goods={goods} showToast={showToast} />;
            case 'procurement-invoice-verify': return <InvoiceVerificationPage supplierInvoices={supplierInvoices} purchaseOrders={purchaseOrders} goodsReceipts={goodsReceipts} showToast={showToast} />;
            case 'procurement-contracts': return <PurchaseContractsPage contracts={purchaseContracts} suppliers={parties} showToast={showToast} />;
            case 'inventory-batch-serial': return <BatchSerialTraceabilityPage batches={batches} serialNumbers={serialNumbers} />;
            case 'inventory-quality': return <QualityControlPage inspectionLots={inspectionLots} setInspectionLots={setInspectionLots} showToast={showToast} />;
            case 'warehouse-structure': return <WarehouseStructurePage structure={warehouseStructure} setStructure={setWarehouseStructure} showToast={showToast} />;
            case 'warehouse-strategy': return <WarehouseStrategyPage strategies={warehouseStrategies} setStrategies={setWarehouseStrategies} showToast={showToast} />;
            case 'warehouse-barcode': return <BarcodePrintingPage goods={goods} />;

            // Asset Management
            case 'asset-fixed-master': return <AssetMasterPage assets={assets} assetClasses={assetClasses} onSaveAsset={onSaveAsset} onDeleteAsset={onDeleteAsset} />;
            case 'asset-fixed-ops': return <AssetTransactionsPage transactions={assetTransactions} assets={assets.filter(a => a.status === 'Active')} onSave={onSaveAssetTransaction} />;
            case 'asset-fixed-depreciation': return <DepreciationRunPage assets={assets.filter(a=>a.status === 'Active')} assetClasses={assetClasses} addJournalEntry={addJournalEntry} showToast={showToast} />;
            case 'asset-pm-objects': return <MaintenanceObjectsPage objects={maintenanceObjects} onSave={onSaveMaintenanceObject} onDelete={()=>{}} />;
            case 'asset-pm-orders': return <MaintenanceOrdersPage orders={maintenanceOrders} objects={maintenanceObjects} onSave={onSaveMaintenanceOrder} />;
            case 'asset-pm-preventive': return <PreventiveMaintenancePage plans={preventivePlans} objects={maintenanceObjects} onSave={onSavePreventivePlan} />;

            // Production Planning
            case 'mfg-data-bom': return <BOMPage boms={boms} goods={goods} onSaveBOM={onSaveBOM} />;
            case 'mfg-data-workcenter': return <WorkCenterPage workCenters={workCenters} routings={routings} goods={goods} onSaveWorkCenter={onSaveWorkCenter} onSaveRouting={onSaveRouting} />;
            case 'mfg-control-orders': return <ProductionOrdersPage productionOrders={productionOrders} goods={goods} boms={boms} routings={routings} onAddOrder={addProductionOrder} onUpdateOrder={updateProductionOrder} />;
            case 'mfg-control-mrp': return <MRPPage goods={goods} runMRP={runMRP} onConvert={convertMRPResult} />;
            case 'mfg-control-sfc': return <ShopFloorControlPage activeOrders={productionOrders.filter(o => o.status === 'آزاد شده' || o.status === 'در حال تولید')} workCenters={workCenters} routings={routings} onConfirmOperation={updateProductionOrder}/>;
            case 'mfg-costing-product': return <ProductCostingPage completedOrders={productionOrders.filter(o => o.status === 'تایید شده' || o.status === 'بسته شده')} />;
            case 'mfg-costing-variance': return <ProductionVariancePage completedOrders={productionOrders.filter(o => o.status === 'تایید شده' || o.status === 'بسته شده')} />;

            // Project System
            case 'ps-control-reports': return <ProjectDashboardPage projects={projects} wbs={wbs} />;
            case 'ps-def-wbs': return <WBSPage wbs={wbs} setWbs={setWbs} projects={projects} />;
            case 'ps-def-networks': return <NetworkPage activities={projectActivities} setActivities={setProjectActivities} wbs={wbs} />;
            case 'ps-plan-cost': return <CostPlanningPage wbs={wbs} setWbs={setWbs} projects={projects} />;
            case 'ps-plan-resource': return <ResourcePlanningPage activities={projectActivities} />;
            case 'ps-plan-schedule': return <SchedulePage activities={projectActivities} wbs={wbs} projects={projects} />;
            case 'ps-exec-timesheet': return <TimesheetPage timesheets={timesheets} setTimesheets={setTimesheets} wbs={wbs} />;
            case 'ps-exec-procurement': return <ProjectProcurementPage purchaseRequests={purchaseRequests} purchaseOrders={purchaseOrders} />;
            case 'ps-exec-billing': return <ProjectBillingPage projectBillings={projectBillings} projects={projects} />;
            
            // Admin
            case 'admin-setup-company': return <CompanyInfoPage companyInfo={companyInfo} onSave={updateCompanyInfo} />;
            case 'admin-setup-users': return <UsersPage users={users} roles={roles} onSaveUser={(user) => ('id' in user ? updateUser(user as User) : addUser(user))} />;
            
            // BI
            case 'bi-dashboards': return <BIDashboardsPage widgets={biWidgets} setWidgets={setBiWidgets} invoices={customerInvoices} parties={parties} />;

            // Master Data (NEW)
            case 'master-data-gl-accounts': return <MasterDataAccountsPage accounts={accounts} addAccount={()=>{}} updateAccount={()=>{}} deleteAccount={()=>{}} getAccountLedger={() => []}/>;
            case 'master-data-detailed-accounts': return <MasterDataDetailedAccountsPage tafsiliGroups={tafsiliGroups} tafsiliAccounts={tafsiliAccounts} glAccounts={accounts} setTafsiliAccounts={setTafsiliAccounts} showToast={showToast} />;
            case 'master-data-cost-centers': return <MasterDataCostCentersPage costCenters={costCenters} addCostCenter={()=>{}} updateCostCenter={()=>{}} deleteCostCenter={()=>{}} />;
            case 'master-data-banks': return <MasterDataBanksPage banks={banks} onSave={onSaveBank} onDelete={(id) => setBanks(prev => prev.filter(b => b.id !== id))} />;
            case 'master-data-bank-accounts': return <MasterDataBankAccountsPage bankAccounts={bankAccounts} addBankAccount={addBankAccount} updateBankAccount={updateBankAccount} deleteBankAccount={deleteBankAccount} showToast={showToast} />;
            case 'master-data-cash-desks': return <MasterDataCashDeskPage cashDesks={cashDesks} treasuryDocs={treasuryDocs} addCashDesk={addCashDesk} updateCashDesk={updateCashDesk} deleteCashDesk={deleteCashDesk} showToast={showToast} />;
            case 'master-data-parties': return <MasterDataPartiesPage parties={parties} addParty={addParty} updateParty={updateParty} deleteParty={deleteParty} />;
            case 'master-data-goods': return <MasterDataGoodsPage goods={goods} addGood={addGood} updateGood={updateGood} deleteGood={deleteGood} />;
            case 'master-data-asset-classes': return <MasterDataAssetClassesPage assetClasses={assetClasses} onSave={onSaveAssetClass} onDelete={(id) => setAssetClasses(prev => prev.filter(ac => ac.id !== id))} />;

            // HCM
            case 'hcm-admin-master': return <EmployeeMasterPage employees={employees} onSaveEmployee={onSaveEmployee} showToast={showToast} />;
            case 'hcm-admin-org': return <OrgStructurePage orgStructure={orgStructure} />;
            case 'hcm-payroll-calc': return <PayrollCalculationPage onRunPayroll={onRunPayroll} payslips={payslips} showToast={showToast} />;
            case 'hcm-payroll-reports': return <PayrollReportsPage />;
            case 'hcm-time-attendance': return <AttendancePage attendance={attendance} />;
            case 'hcm-talent-recruitment': return <RecruitmentPage jobOpenings={jobOpenings} candidates={candidates} onUpdateCandidate={onUpdateCandidate} />;
            case 'hcm-talent-performance': return <PerformancePage reviews={reviews} />;
            case 'hcm-talent-learning': return <LearningPage courses={trainings} />;
            case 'hcm-ess-portal': return <EmployeePortalPage employee={employees[0]} payslips={payslips} attendance={attendance} />;


            default: return <div className="p-6 text-center text-gray-500">صفحه مورد نظر یافت نشد یا در دست ساخت است.</div>;
        }
    };
    
    return (
        <div className={`font-sans ${theme}`}>
            <div className="flex h-screen bg-[#F8F7FA] dark:bg-[#0F111A] overflow-hidden">
                <Sidebar 
                    isOpen={isSidebarOpen} 
                    activePage={activePage} 
                    onNavigate={setActivePage} 
                    onCloseMobile={() => setSidebarOpen(false)} // Close sidebar on mobile overlay click or nav
                />
                
                {/* Main Content Wrapper - Adjust margin based on sidebar state */}
                <div className={`flex-1 flex flex-col transition-all duration-300 ease-out ${isSidebarOpen ? 'md:mr-72' : 'mr-0'} relative w-full`}>
                    <Header 
                        onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
                        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
                        currentTheme={theme}
                        pageTitle={pageTitle}
                        breadcrumbs={breadcrumbs}
                    />
                    <main className="p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 h-[calc(100vh-80px)]">
                        {renderPage()}
                    </main>
                </div>
                <ToastContainer toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
            </div>
        </div>
    );
};
