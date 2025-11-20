import React, { useState, useMemo } from 'react';
import type { BIWidget, Invoice, Party, BIWidgetComponentType } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { IconLayoutGrid, IconX, IconPlusCircle } from '../Icons';
import * as WidgetComponents from './widgets/WidgetComponents';

const WIDGET_LIBRARY: { component: BIWidgetComponentType; title: string; description: string, defaultGrid: { col: string; row: string; }, props?: { [key: string]: any } }[] = [
    { component: 'KPIWidget', title: 'فروش کل', description: 'نمایش یک معیار کلیدی', defaultGrid: { col: 'span 3', row: 'span 1'}, props: { metric: 'totalSales'} },
    { component: 'KPIWidget', title: 'تعداد فاکتور', description: 'نمایش یک معیار کلیدی', defaultGrid: { col: 'span 3', row: 'span 1'}, props: { metric: 'invoiceCount'} },
    { component: 'KPIWidget', title: 'میانگین فاکتور', description: 'نمایش یک معیار کلیدی', defaultGrid: { col: 'span 3', row: 'span 1'}, props: { metric: 'avgInvoice'} },
    { component: 'KPIWidget', title: 'مطالبات معوق', description: 'نمایش یک معیار کلیدی', defaultGrid: { col: 'span 3', row: 'span 1'}, props: { metric: 'arOverdue'} },
    { component: 'SalesOverTimeWidget', title: 'روند فروش ماهانه', description: 'نمودار ستونی فروش در ماه‌های اخیر', defaultGrid: { col: 'span 8', row: 'span 2'} },
    { component: 'TopCustomersWidget', title: 'مشتریان برتر', description: 'لیست ۵ مشتری برتر بر اساس مبلغ خرید', defaultGrid: { col: 'span 4', row: 'span 2'} },
    { component: 'AccountsReceivableAgingWidget', title: 'مرور سن بدهکاران', description: 'نمودار ستونی مطالبات معوق', defaultGrid: { col: 'span 12', row: 'span 2'} },
];


interface BIDashboardsPageProps {
    widgets: BIWidget[];
    setWidgets: React.Dispatch<React.SetStateAction<BIWidget[]>>;
    invoices: Invoice[];
    parties: Party[];
}

export const BIDashboardsPage: React.FC<BIDashboardsPageProps> = ({ widgets, setWidgets, invoices, parties }) => {
    const [isEditMode, setIsEditMode] = useState(false);

    const removeWidget = (id: string) => {
        setWidgets(prev => prev.filter(w => w.id !== id));
    };
    
    const addWidget = (widgetInfo: typeof WIDGET_LIBRARY[0]) => {
        const newWidget: BIWidget = {
            id: uuidv4(),
            component: widgetInfo.component,
            title: widgetInfo.title,
            gridColumn: widgetInfo.defaultGrid.col,
            gridRow: widgetInfo.defaultGrid.row,
            props: widgetInfo.props
        };
        setWidgets(prev => [...prev, newWidget]);
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">داشبورد هوش تجاری (BI)</h1>
                <div className="flex items-center gap-2">
                    {isEditMode && <button onClick={() => {}} className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600">ذخیره چیدمان</button>}
                    <button onClick={() => setIsEditMode(!isEditMode)} className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg shadow-md transition-colors ${isEditMode ? 'bg-red-500 text-white' : 'bg-primary text-white'}`}>
                       {isEditMode ? <IconX className="w-5 h-5" /> : <IconLayoutGrid className="w-5 h-5" />}
                       <span>{isEditMode ? 'خروج از حالت ویرایش' : 'ویرایش چیدمان'}</span>
                    </button>
                </div>
            </div>
            
            <div className="flex gap-6 flex-grow min-h-0">
                <div className={`flex-grow transition-all duration-300 ${isEditMode ? 'edit-mode' : ''}`}>
                    {widgets.length > 0 ? (
                        <div className="bi-grid h-full overflow-y-auto pr-2">
                            {widgets.map(widget => {
                                const renderSpecificWidget = () => {
                                    const commonProps = {
                                        title: widget.title,
                                        invoices: invoices,
                                        parties: parties,
                                    };
                                    switch (widget.component) {
                                        case 'KPIWidget':
                                            // FIX: Explicitly pass the 'metric' prop to 'KPIWidget' to satisfy TypeScript's type checker, which couldn't infer it from the spread 'widget.props'.
                                            return <WidgetComponents.KPIWidget {...commonProps} metric={widget.props!.metric} />;
                                        case 'SalesOverTimeWidget':
                                            return <WidgetComponents.SalesOverTimeWidget {...commonProps} {...widget.props} />;
                                        case 'TopCustomersWidget':
                                            return <WidgetComponents.TopCustomersWidget {...commonProps} {...widget.props} />;
                                        case 'AccountsReceivableAgingWidget':
                                            return <WidgetComponents.AccountsReceivableAgingWidget {...commonProps} {...widget.props} />;
                                        default:
                                            return null;
                                    }
                                };
                                return (
                                    <div key={widget.id} className="widget-wrapper" style={{ gridColumn: widget.gridColumn, gridRow: widget.gridRow }}>
                                        {isEditMode && (
                                            <button onClick={() => removeWidget(widget.id)} className="widget-remove-btn items-center justify-center w-6 h-6 text-red-500 hover:text-red-700">
                                                <IconX className="w-4 h-4"/>
                                            </button>
                                        )}
                                        {renderSpecificWidget()}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                         <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed dark:border-gray-700">
                             <IconLayoutGrid className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                             <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">داشبورد شما خالی است</h3>
                             <p className="text-gray-500 mt-2">برای افزودن ویجت، {isEditMode ? 'از کتابخانه ویجت‌ها در سمت چپ استفاده کنید.' : 'وارد حالت «ویرایش چیدمان» شوید.'}</p>
                        </div>
                    )}
                </div>
                
                 <aside className={`bi-widget-library w-72 h-full p-4 space-y-3 overflow-y-auto rounded-lg shadow-lg ${!isEditMode ? 'bi-widget-library-hidden' : 'animate-fade-in-right'}`}>
                    <h3 className="font-bold text-lg border-b pb-2 text-gray-800 dark:text-white">کتابخانه ویجت‌ها</h3>
                    {WIDGET_LIBRARY.map(w => (
                        <div key={w.component + w.title} className="widget-library-item p-3 rounded-md">
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{w.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{w.description}</p>
                            <button onClick={() => addWidget(w)} className="text-sm text-primary font-semibold mt-2 flex items-center gap-1 hover:underline"><IconPlusCircle className="w-4 h-4" /> افزودن</button>
                        </div>
                    ))}
                </aside>
            </div>
        </div>
    );
};