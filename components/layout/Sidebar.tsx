
import React, { useState, useEffect, useMemo } from 'react';
import type { NavItemType } from '../../types';
import { 
    IconDashboard, IconWallet, IconChartPie, IconShoppingCart, IconBuildingStore,
    IconSettings, IconChevronLeft, IconBrand, IconComponents, IconRoles, IconTable,
    IconUser, IconBook, IconFileText, IconChart, IconBuildingBank, IconGlobe, IconBriefcase
} from '../Icons';


interface NavGroup {
    title: string;
    items: NavItemType[];
}

const navGroups: NavGroup[] = [
    {
        title: '',
        items: [
            { label: 'داشبورد مدیریتی', icon: <IconDashboard />, path: 'dashboard' },
        ]
    },
    {
        title: 'مدیریت مالی و خزانه‌داری',
        items: [
            { 
                label: 'حسابداری (دفتر کل)', 
                icon: <IconChartPie />, 
                path: 'financials', 
                children: [
                    { 
                        label: 'عملیات حسابداری',
                        children: [
                            { label: 'سند حسابداری جدید', path: 'financials-gl-new' },
                            { label: 'فهرست اسناد', path: 'financials-gl-list' },
                            { label: 'اسناد دوره‌ای', path: 'financials-gl-recurring' },
                            { label: 'الگوهای سند', path: 'financials-gl-templates' },
                            { label: 'عملیات پایان سال', path: 'financials-gl-closing' },
                        ]
                    },
                    {
                        label: 'حساب‌های پرداختنی (AP)',
                        children: [
                            { label: 'میزکار پرداختنی‌ها', path: 'financials-ap-invoices' },
                            { label: 'پردازش پرداخت', path: 'financials-ap-payments' },
                            { label: 'گزارش مرور بدهی', path: 'financials-ap-aging' },
                        ]
                    },
                    {
                        label: 'حساب‌های دریافتنی (AR)',
                        children: [
                            { label: 'فاکتورهای مشتریان', path: 'financials-ar-invoices' },
                            { label: 'دریافت‌ها و وصول', path: 'financials-ar-receipts' },
                            { label: 'پیگیری مطالبات', path: 'financials-ar-dunning' },
                        ]
                    },
                    {
                        label: 'حسابداری بهای تمام شده',
                        children: [
                            { label: 'تسهیم هزینه‌ها', path: 'financials-cost-allocation' },
                            { label: 'گزارش مرکز هزینه', path: 'financials-cost-report' },
                            { label: 'هزینه‌یابی استاندارد', path: 'financials-cost-standard' },
                            { label: 'هزینه‌یابی (ABC)', path: 'financials-cost-abc' },
                            { label: 'سفارشات داخلی', path: 'financials-cost-internal-orders' },
                        ]
                    },
                     {
                        label: 'بودجه و اعتبارات',
                        children: [
                            { label: 'تعریف بودجه', path: 'financials-budget-define' },
                            { label: 'کنترل بودجه', path: 'financials-budget-actuals' },
                        ]
                    },
                    {
                        label: 'گزارشات مالی',
                        children: [
                            { label: 'تراز و دفاتر', path: 'financials-reports-standard' },
                            { label: 'صورت‌های مالی', path: 'financials-reports-statements' },
                            { label: 'تلفیق (Consolidation)', path: 'financials-reports-consolidation' },
                            { label: 'گزارش‌ساز پویا', path: 'financials-reports-builder' },
                        ]
                    },
                    {
                        label: 'تنظیمات مالی',
                        children: [
                            { label: 'مالیات و عوارض', path: 'financials-setup-tax' },
                            { label: 'ارز و تسعیر', path: 'financials-setup-currency' },
                        ]
                    }
                ]
            },
            { 
                label: 'خزانه‌داری (نقد و بانک)', 
                icon: <IconWallet />, 
                path: 'treasury', 
                children: [
                    { label: 'میزکار خزانه', path: 'treasury-dashboard' },
                    { label: 'دریافت جدید', path: 'treasury-receive' },
                    { label: 'پرداخت جدید', path: 'treasury-payment' },
                    { label: 'مدیریت چک‌ها', path: 'treasury-cash-checks' },
                    { label: 'مغایرت‌گیری بانکی', path: 'treasury-bank-reconciliation' },
                    { label: 'پیش‌بینی جریان نقد', path: 'treasury-liquidity-forecast' },
                ]
            },
            { 
                label: 'اموال و دارایی ثابت', 
                icon: <IconTable />, 
                path: 'assets', 
                children: [
                    {
                        label: 'مدیریت اموال',
                        children: [
                            { label: 'پلاک‌گذاری و تحصیل', path: 'asset-fixed-master' },
                            { label: 'عملیات دارایی', path: 'asset-fixed-ops' },
                            { label: 'محاسبه استهلاک', path: 'asset-fixed-depreciation' },
                        ]
                    },
                    {
                        label: 'نگهداری و تعمیرات (PM)',
                        children: [
                            { label: 'تجهیزات', path: 'asset-pm-objects' },
                            { label: 'دستورکار تعمیرات', path: 'asset-pm-orders' },
                            { label: 'نگهداری پیشگیرانه', path: 'asset-pm-preventive' },
                        ]
                    }
                ]
            },
        ]
    },
    {
        title: 'زنجیره تامین و فروش',
        items: [
            { 
                label: 'فروش و پخش (SD)', 
                icon: <IconShoppingCart />, 
                path: 'sales', 
                children: [
                    { 
                        label: 'چرخه فروش',
                        children: [
                            { label: 'پیش‌فاکتور', path: 'sales-ops-quote' },
                            { label: 'سفارش مشتری', path: 'sales-ops-order' },
                            { label: 'حواله فروش', path: 'sales-ops-delivery' },
                            { label: 'فاکتور فروش', path: 'sales-ops-billing' },
                            { label: 'قراردادهای فروش', path: 'sales-ops-contracts' },
                        ]
                    },
                    {
                        label: 'CRM و خدمات',
                        children: [
                            { label: 'مدیریت فرصت‌ها', path: 'sales-crm-opportunities' },
                            { label: 'تیکت‌های پشتیبانی', path: 'sales-crm-service-tickets' },
                            { label: 'قراردادهای خدمات', path: 'sales-crm-service-contracts' },
                            { label: 'خدمات در محل', path: 'sales-crm-field-service' },
                        ]
                    },
                    {
                        label: 'فروشگاهی (POS)',
                        children: [
                            { label: 'مدیریت صندوق‌ها', path: 'sales-pos-terminals' },
                            { label: 'بستن روزانه', path: 'sales-pos-closing' },
                        ]
                    },
                     {
                        label: 'سیاست‌گذاری قیمت',
                        children: [
                            { label: 'لیست‌های قیمت', path: 'sales-pricing-lists' },
                            { label: 'تخفیفات و جوایز', path: 'sales-pricing-discounts' },
                            { label: 'فرمول قیمت‌گذاری', path: 'sales-pricing-procedure' },
                            { label: 'تحلیل قیمت', path: 'sales-pricing-analysis' },
                        ]
                    },
                    { label: 'داشبورد فروش', path: 'sales-analytics-dashboard' },
                ]
            },
            { 
                label: 'تدارکات و انبار (MM)', 
                icon: <IconBuildingStore />,
                path: 'procurement', 
                children: [
                    {
                        label: 'خرید داخلی',
                        children: [
                            { label: 'درخواست خرید (PR)', path: 'procurement-req' },
                            { label: 'استعلام (RFQ)', path: 'procurement-rfq' },
                            { label: 'سفارش خرید (PO)', path: 'procurement-po' },
                            { label: 'رسید کالا (GR)', path: 'procurement-receipt' },
                            { label: 'کنترل فاکتور خرید', path: 'procurement-invoice-verify' },
                            { label: 'قراردادهای خرید', path: 'procurement-contracts' },
                        ]
                    },
                    {
                        label: 'تدارکات خارجی (واردات)',
                        children: [
                            { label: 'پرونده سفارش خارجی', path: 'procurement-foreign-order' },
                            { label: 'پروفرما اینویس', path: 'procurement-proforma' },
                            { label: 'بیمه و حمل', path: 'procurement-shipping' },
                            { label: 'امور گمرکی و ترخیص', path: 'procurement-customs' },
                            { label: 'تسهیم هزینه (Landed Cost)', path: 'procurement-landed-cost' },
                        ]
                    },
                    {
                        label: 'مدیریت انبار',
                        children: [
                            { label: 'کاردکس کالا', path: 'inventory-movements' },
                            { label: 'انبارگردانی', path: 'inventory-stocktaking' },
                            { label: 'رهگیری (Batch/Serial)', path: 'inventory-batch-serial' },
                            { label: 'کنترل کیفیت (QC)', path: 'inventory-quality' },
                             { label: 'جانمایی انبار', path: 'warehouse-structure' },
                            { label: 'استراتژی انبار', path: 'warehouse-strategy' },
                            { label: 'چاپ بارکد', path: 'warehouse-barcode' },
                        ]
                    },
                    { label: 'داشبورد تدارکات', path: 'procurement-analytics-dashboard' }
                ]
            },
             { 
                label: 'تولید و برنامه‌ریزی (PP)', 
                icon: <IconComponents />,
                path: 'manufacturing', 
                children: [
                    {
                        label: 'مهندسی محصول',
                        children: [
                             { label: 'فرمول ساخت (BOM)', path: 'mfg-data-bom' },
                             { label: 'خط تولید (Routing)', path: 'mfg-data-workcenter' },
                        ]
                    },
                    {
                        label: 'اجرای تولید',
                        children: [
                            { label: 'دستور تولید', path: 'mfg-control-orders' },
                            { label: 'برنامه‌ریزی (MRP)', path: 'mfg-control-mrp' },
                            { label: 'کنترل تولید (SFC)', path: 'mfg-control-sfc' },
                        ]
                    },
                    {
                        label: 'کنترل صنعتی',
                        children: [
                            { label: 'بهای تمام شده', path: 'mfg-costing-product' },
                            { label: 'تحلیل انحرافات', path: 'mfg-costing-variance' },
                        ]
                    }
                ]
            },
            { 
                label: 'پروژه و پیمانکاری (PS)', 
                icon: <IconBriefcase />,
                path: 'projects', 
                children: [
                    {
                        label: 'تعاریف پروژه',
                        children: [
                             { label: 'ساختار شکست (WBS)', path: 'ps-def-wbs' },
                             { label: 'شبکه فعالیت‌ها', path: 'ps-def-networks' },
                        ]
                    },
                    {
                        label: 'مدیریت پیمان',
                        children: [
                             { label: 'قرارداد پیمانکاری', path: 'ps-contract-master' },
                             { label: 'صورت وضعیت پیمانکار', path: 'ps-contract-statement' },
                             { label: 'مدیریت ضمانت‌نامه‌ها', path: 'ps-contract-guarantees' },
                             { label: 'کسورات و بیمه', path: 'ps-contract-deductions' },
                        ]
                    },
                    {
                        label: 'برنامه‌ریزی',
                        children: [
                            { label: 'هزینه و بودجه', path: 'ps-plan-cost' },
                            { label: 'منابع انسانی', path: 'ps-plan-resource' },
                            { label: 'زمان‌بندی (Gantt)', path: 'ps-plan-schedule' },
                        ]
                    },
                    {
                        label: 'اجرا و کنترل',
                        children: [
                            { label: 'کارکرد (Timesheet)', path: 'ps-exec-timesheet' },
                            { label: 'تدارکات پروژه', path: 'ps-exec-procurement' },
                            { label: 'صورت وضعیت کارفرما', path: 'ps-exec-billing' },
                        ]
                    },
                    { label: 'داشبورد پروژه', path: 'ps-control-reports' }
                ]
            },
        ]
    },
    {
        title: 'سرمایه انسانی و اداری',
        items: [
             { 
                label: 'منابع انسانی (HCM)', 
                icon: <IconUser />, 
                path: 'hcm', 
                children: [
                    { 
                        label: 'کارگزینی',
                        children: [
                            { label: 'پرونده پرسنلی', path: 'hcm-admin-master' },
                            { label: 'چارت سازمانی', path: 'hcm-admin-org' },
                            { label: 'احکام پرسنلی', path: 'hcm-admin-contracts' },
                        ]
                    },
                    {
                        label: 'حقوق و دستمزد',
                        children: [
                            { label: 'عوامل حقوقی', path: 'hcm-payroll-elements' },
                            { label: 'محاسبه حقوق', path: 'hcm-payroll-calc' },
                            { label: 'فیش و دیسکت', path: 'hcm-payroll-reports' },
                        ]
                    },
                    { label: 'مدیریت تردد', path: 'hcm-time-attendance' },
                    {
                        label: 'مدیریت استعداد',
                        children: [
                            { label: 'جذب و استخدام', path: 'hcm-talent-recruitment' },
                            { label: 'ارزیابی عملکرد', path: 'hcm-talent-performance' },
                            { label: 'آموزش', path: 'hcm-talent-learning' },
                        ]
                    },
                    { label: 'پورتال پرسنل', path: 'hcm-ess-portal' },
                ]
            },
        ]
    },
    {
        title: 'تنظیمات و اطلاعات پایه',
        items: [
            { 
                label: 'داده‌های پایه (Master Data)', 
                icon: <IconBook />, 
                path: 'master-data', 
                children: [
                    {
                        label: 'مالی و حسابداری',
                        children: [
                            { label: 'کدینگ حساب‌ها', path: 'master-data-gl-accounts' },
                            { label: 'تفصیلی شناور', path: 'master-data-detailed-accounts' },
                            { label: 'مراکز هزینه', path: 'master-data-cost-centers' },
                        ]
                    },
                    {
                        label: 'بانکی و نقد',
                        children: [
                            { label: 'تعریف بانک‌ها', path: 'master-data-banks' },
                            { label: 'حساب‌های بانکی', path: 'master-data-bank-accounts' },
                            { label: 'صندوق و تنخواه', path: 'master-data-cash-desks' },
                        ]
                    },
                    {
                        label: 'بازرگانی',
                        children: [
                            { label: 'طرف حساب‌ها', path: 'master-data-parties' },
                            { label: 'کالا و خدمات', path: 'master-data-goods' },
                        ]
                    },
                    {
                        label: 'اموال',
                        children: [
                            { label: 'کلاس‌های دارایی', path: 'master-data-asset-classes' },
                        ]
                    },
                ]
            },
            {
                label: 'هوش تجاری (BI)',
                icon: <IconChart />,
                path: 'bi',
                children: [
                    { label: 'داشبورد ساز', path: 'bi-dashboards' },
                ]
            },
            {
                label: 'مدیریت سیستم',
                icon: <IconSettings />,
                path: 'admin',
                children: [
                    { 
                        label: 'پیکربندی',
                        children: [
                            { label: 'مشخصات شرکت', path: 'admin-setup-company' },
                            { label: 'کاربران و نقش‌ها', path: 'admin-setup-users' },
                        ]
                    },
                    { label: 'تنظیمات سیستمی', path: 'admin-setup-workflows' },
                ]
            }
        ]
    }
];

const isChildOfActive = (item: NavItemType, activePage: string): boolean => {
    if (!item.children) return false;
    return item.children.some(c => c.path === activePage || isChildOfActive(c, activePage));
};

const MenuItem: React.FC<{
    item: NavItemType;
    level: number;
    activePage: string;
    onNavigate: (page: string) => void;
}> = ({ item, level, activePage, onNavigate }) => {
    const isChildActive = useMemo(() => isChildOfActive(item, activePage), [item, activePage]);
    const [isExpanded, setIsExpanded] = useState(isChildActive);
    
    useEffect(() => {
        if (isChildActive) {
            setIsExpanded(true);
        }
    }, [isChildActive, activePage]);

    const hasChildren = item.children && item.children.length > 0;
    const isActive = activePage === item.path;

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (hasChildren) {
            setIsExpanded(prev => !prev);
        } else if (item.path) {
            onNavigate(item.path);
        }
    };
    
    const isParentActive = isActive || (isChildActive && !isExpanded);
    const indentStyle = { paddingRight: `${0.5 + level * 1.5}rem` };

    return (
        <li className="my-1 transition-all duration-300">
            <a
                href="#"
                onClick={handleClick}
                style={indentStyle}
                className={`flex items-center p-2 text-sm rounded-md transition-colors duration-200 ${
                    isParentActive ? 'bg-primary text-white shadow-lg' :
                    isActive ? 'text-primary dark:text-primary-300 font-semibold' :
                    'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
                {level === 0 && item.icon}
                {level > 0 && <span className={`w-1.5 h-1.5 rounded-full ml-4 transition-colors ${isActive || isParentActive ? 'bg-white' : 'bg-gray-400'}`}></span>}
                <span className={`${level > 0 ? '' : 'mr-3'} flex-1`}>{item.label}</span>
                {hasChildren && <IconChevronLeft className={`w-4 h-4 transition-transform ${isExpanded ? '-rotate-90' : ''}`} />}
            </a>
            {hasChildren && isExpanded && (
                <ul className="mt-1 space-y-1">
                    {item.children?.map((child) => (
                        <MenuItem 
                            key={child.path || child.label} 
                            item={child} 
                            level={level + 1} 
                            activePage={activePage} 
                            onNavigate={onNavigate} 
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

interface SidebarProps {
    isOpen: boolean;
    activePage: string;
    onNavigate: (page: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, activePage, onNavigate }) => {
    return (
        <aside className={`fixed top-0 right-0 h-full bg-white dark:bg-gray-800 shadow-lg z-30 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} w-64`}>
            <div className="flex items-center justify-center p-4 border-b dark:border-gray-700">
                 <IconBrand />
                <h1 className="text-xl font-bold mr-2 text-gray-800 dark:text-white">سپیدار ERP</h1>
            </div>
            <nav className="p-2 h-[calc(100vh-65px)] overflow-y-auto">
                {navGroups.map((group, index) => (
                    <div key={group.title || index} className="mb-2">
                        {group.title && (
                            <h3 className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">{group.title}</h3>
                        )}
                        <ul>
                            {group.items.map((item) => (
                                <MenuItem 
                                    key={item.path || item.label}
                                    item={item}
                                    level={0}
                                    activePage={activePage}
                                    onNavigate={onNavigate}
                                />
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>
        </aside>
    );
};
