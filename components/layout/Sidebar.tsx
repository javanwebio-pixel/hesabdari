
import React, { useState, useEffect, useMemo, memo } from 'react';
import type { NavItemType } from '../../types';
import { 
    IconDashboard, IconWallet, IconChartPie, IconShoppingCart, IconBuildingStore,
    IconSettings, IconChevronLeft, IconBrand, IconComponents, IconRoles, IconTable,
    IconUser, IconBook, IconFileText, IconChart, IconBuildingBank
} from '../Icons';


export interface NavGroup {
    title: string;
    items: NavItemType[];
}

// Exported for use in App.tsx for breadcrumbs
export const navGroups: NavGroup[] = [
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
                            { label: 'تبدیل اسناد', path: 'financials-convert-docs' },
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
                    { label: 'چک جدید', path: 'treasury-new-check' },
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
                        label: 'خرید و تدارکات',
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
                label: 'مدیریت پروژه (PS)', 
                icon: <IconFileText />,
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
                        label: 'برنامه‌ریزی',
                        children: [
                            { label: 'هزینه و بودجه', path: 'ps-plan-cost' },
                            { label: 'منابع انسانی', path: 'ps-plan-resource' },
                            { label: 'زمان‌بندی (Gantt)', path: 'ps-plan-schedule' },
                        ]
                    },
                    {
                        label: 'اجرای و کنترل',
                        children: [
                            { label: 'کارکرد (Timesheet)', path: 'ps-exec-timesheet' },
                            { label: 'تدارکات پروژه', path: 'ps-exec-procurement' },
                            { label: 'صورت وضعیت', path: 'ps-exec-billing' },
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
                        ]
                    },
                    {
                        label: 'حقوق و دستمزد',
                        children: [
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

// Memoized MenuItem to prevent unnecessary re-renders and improve performance
const MenuItem: React.FC<{
    item: NavItemType;
    level: number;
    activePage: string;
    onNavigate: (page: string) => void;
}> = memo(({ item, level, activePage, onNavigate }) => {
    const isChildActive = useMemo(() => isChildOfActive(item, activePage), [item, activePage]);
    const [isExpanded, setIsExpanded] = useState(isChildActive);
    
    useEffect(() => {
        if (isChildActive) {
            setIsExpanded(true);
        }
    }, [isChildActive]);

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
        <li className="my-1">
            <a
                href="#"
                onClick={handleClick}
                style={indentStyle}
                className={`flex items-center p-2.5 text-sm rounded-xl transition-colors duration-200 group relative overflow-hidden ${
                    isParentActive ? 'bg-primary text-white shadow-lg shadow-primary/40' :
                    isActive ? 'text-primary dark:text-primary-300 font-semibold bg-primary-50 dark:bg-primary-900/20' :
                    'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
                <span className="z-10 flex items-center w-full">
                    {level === 0 && <span className={`mr-1 opacity-80 group-hover:opacity-100 transition-opacity ${isParentActive ? 'text-white' : ''}`}>{item.icon}</span>}
                    {level > 0 && <span className={`w-1.5 h-1.5 rounded-full ml-4 transition-colors ${isActive || isParentActive ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-gray-400 group-hover:bg-gray-600'}`}></span>}
                    <span className={`${level > 0 ? '' : 'mr-3'} flex-1 truncate`}>{item.label}</span>
                    {hasChildren && <IconChevronLeft className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? '-rotate-90' : ''} opacity-70`} />}
                </span>
            </a>
            {hasChildren && (
                <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <ul className="overflow-hidden">
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
                </div>
            )}
        </li>
    );
});

interface SidebarProps {
    isOpen: boolean;
    activePage: string;
    onNavigate: (page: string) => void;
    onCloseMobile: () => void; // New prop to close sidebar on mobile
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, activePage, onNavigate, onCloseMobile }) => {
    
    // Close sidebar when navigating on mobile
    const handleNavigate = (page: string) => {
        onNavigate(page);
        if (window.innerWidth < 768) {
            onCloseMobile();
        }
    }

    return (
        <>
            {/* Mobile Overlay */}
            <div 
                className={`fixed inset-0 bg-black/50 z-60 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} 
                onClick={onCloseMobile}
            />

            {/* Sidebar Container - Using Transform for Performance */}
            <aside 
                className={`fixed top-0 right-0 h-full w-72 bg-white dark:bg-[#151923] border-l border-gray-200 dark:border-[#2d324a] z-70 shadow-2xl transition-transform duration-300 ease-out gpu-accelerated ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex items-center justify-center h-20 border-b dark:border-[#2d324a] bg-white/50 dark:bg-[#151923]/50 backdrop-blur-sm">
                     <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigate('dashboard')}>
                        <IconBrand />
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight leading-none">سپیدار <span className="text-primary">ERP</span></h1>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 tracking-wider uppercase font-bold">Enterprise Edition</span>
                        </div>
                    </div>
                </div>
                <nav className="p-4 h-[calc(100vh-80px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                    {navGroups.map((group, index) => (
                        <div key={group.title || index} className="mb-6">
                            {group.title && (
                                <h3 className="px-4 mb-2 text-[11px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider opacity-80">{group.title}</h3>
                            )}
                            <ul>
                                {group.items.map((item) => (
                                    <MenuItem 
                                        key={item.path || item.label}
                                        item={item}
                                        level={0}
                                        activePage={activePage}
                                        onNavigate={handleNavigate}
                                    />
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
};
