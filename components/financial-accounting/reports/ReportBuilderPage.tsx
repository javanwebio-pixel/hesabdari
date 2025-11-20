import React, { useState, useMemo } from 'react';
import type { PivotField, DataSource } from '../../../types';
import { IconDeviceFloppy, IconChartPie, IconTable, IconXCircle } from '../../Icons';

// Mock Data
const mockDataSources: DataSource[] = [
    { id: 'sales', name: 'فروش', fields: [
        { id: 'sales_customer', name: 'مشتری', type: 'dimension' },
        { id: 'sales_product', name: 'محصول', type: 'dimension' },
        { id: 'sales_amount', name: 'مبلغ فروش', type: 'measure' },
        { id: 'sales_quantity', name: 'تعداد فروش', type: 'measure' },
    ]},
    { id: 'gl', name: 'دفتر کل', fields: [
        { id: 'gl_account', name: 'حساب', type: 'dimension' },
        { id: 'gl_costCenter', name: 'مرکز هزینه', type: 'dimension' },
        { id: 'gl_debit', name: 'مبلغ بدهکار', type: 'measure' },
        { id: 'gl_credit', name: 'مبلغ بستانکار', type: 'measure' },
    ]}
];

const mockReportData = [
    { sales_customer: 'مشتری آلفا', sales_product: 'محصول A', sales_amount: 15000000, sales_quantity: 10 },
    { sales_customer: 'مشتری آلفا', sales_product: 'محصول B', sales_amount: 8000000, sales_quantity: 5 },
    { sales_customer: 'مشتری بتا', sales_product: 'محصول A', sales_amount: 12000000, sales_quantity: 8 },
    { sales_customer: 'مشتری بتا', sales_product: 'محصول C', sales_amount: 25000000, sales_quantity: 12 },
    { sales_customer: 'مشتری گاما', sales_product: 'محصول A', sales_amount: 18000000, sales_quantity: 12 },
];

const FieldPill: React.FC<{ field: PivotField, onRemove?: () => void, isDraggable?: boolean }> = ({ field, onRemove, isDraggable = true }) => (
    <div 
        draggable={isDraggable}
        onDragStart={e => {
            e.dataTransfer.setData('fieldId', field.id);
            e.dataTransfer.effectAllowed = 'move';
        }}
        className="field-pill flex items-center justify-between bg-gray-200 dark:bg-gray-700 text-sm px-3 py-1.5 rounded-md"
    >
        <span className="font-medium text-gray-700 dark:text-gray-200">{field.name}</span>
        {onRemove && <button onClick={onRemove} className="mr-2 text-gray-500 hover:text-red-500"><IconXCircle className="w-4 h-4" /></button>}
    </div>
);

const DropZone: React.FC<{ title: string, fields: PivotField[], onDrop: (fieldId: string) => void, onRemove: (fieldId: string) => void }> = ({ title, fields, onDrop, onRemove }) => {
    const [isOver, setIsOver] = useState(false);
    return (
        <div 
            onDragOver={e => { e.preventDefault(); setIsOver(true); e.dataTransfer.dropEffect = "move"; }}
            onDragLeave={() => setIsOver(false)}
            onDrop={e => { e.preventDefault(); setIsOver(false); onDrop(e.dataTransfer.getData('fieldId')); }}
            className={`drop-zone p-4 bg-white dark:bg-gray-800 rounded-lg shadow ${isOver ? 'drag-over' : ''}`}
        >
            <h4 className="font-semibold text-sm mb-2 text-gray-600 dark:text-gray-400">{title}</h4>
            <div className="space-y-2">
                {fields.map(field => <FieldPill key={field.id} field={field} onRemove={() => onRemove(field.id)} />)}
            </div>
        </div>
    );
};

export const ReportBuilderPage: React.FC = () => {
    const [rows, setRows] = useState<PivotField[]>([]);
    const [columns, setColumns] = useState<PivotField[]>([]);
    const [values, setValues] = useState<PivotField[]>([]);
    
    const allFields = useMemo(() => mockDataSources.flatMap(ds => ds.fields.map(f => ({ ...f, parent: ds.name }))), []);
    
    const addField = (fieldId: string, area: 'rows' | 'columns' | 'values') => {
        const field = allFields.find(f => f.id === fieldId);
        if (!field) return;

        const setters = { rows: setRows, columns: setColumns, values: setValues };
        const targetState = { rows, columns, values }[area];
        
        if (targetState.some(f => f.id === fieldId)) return;

        if (area === 'values' && field.type !== 'measure') return;
        if (area !== 'values' && field.type !== 'dimension') return;

        setters[area](prev => [...prev, field]);
    };
    
    const removeField = (fieldId: string, area: 'rows' | 'columns' | 'values') => {
        const setters = { rows: setRows, columns: setColumns, values: setValues };
        setters[area](prev => prev.filter(f => f.id !== fieldId));
    };

    const pivotData = useMemo(() => {
        if (rows.length === 0 || values.length === 0) return null;

        const rowField = rows[0].id;
        const valueField = values[0].id;
        const colField = columns.length > 0 ? columns[0].id : null;

        const uniqueRowValues = [...new Set(mockReportData.map(d => d[rowField as keyof typeof d]))];
        const uniqueColValues = colField ? [...new Set(mockReportData.map(d => d[colField as keyof typeof d]))] : ['Total'];
        
        const data = uniqueRowValues.map(rowValue => {
            const rowData: { [key: string]: any } = { rowHeader: rowValue };
            uniqueColValues.forEach(colValue => {
                const filtered = mockReportData.filter(d => 
                    d[rowField as keyof typeof d] === rowValue &&
                    (colField ? d[colField as keyof typeof d] === colValue : true)
                );
                rowData[colValue] = filtered.reduce((sum, item) => sum + (item[valueField as keyof typeof item] as number), 0);
            });
            return rowData;
        });
        
        return { headers: [rows[0].name, ...uniqueColValues], data };

    }, [rows, columns, values]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">گزارش‌ساز پیشرفته</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">گزارش‌های تحلیلی خود را به صورت پویا و بصری طراحی کنید.</p>
                </div>
                 <button className="btn-primary flex items-center gap-2">
                    <IconDeviceFloppy className="w-5 h-5"/> ذخیره گزارش
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Data Sources Panel */}
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4 self-start">
                    <h3 className="font-semibold">فیلدهای داده</h3>
                    {mockDataSources.map(ds => (
                        <div key={ds.id}>
                            <h4 className="font-semibold text-sm text-gray-500 mb-2">{ds.name}</h4>
                            <div className="space-y-2">
                                {ds.fields.map(field => <FieldPill key={field.id} field={field} />)}
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="lg:col-span-3 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <DropZone title="مقادیر (Values)" fields={values} onDrop={(id) => addField(id, 'values')} onRemove={(id) => removeField(id, 'values')} />
                        <DropZone title="سطرها (Rows)" fields={rows} onDrop={(id) => addField(id, 'rows')} onRemove={(id) => removeField(id, 'rows')} />
                        <DropZone title="ستون‌ها (Columns)" fields={columns} onDrop={(id) => addField(id, 'columns')} onRemove={(id) => removeField(id, 'columns')} />
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 min-h-[20rem]">
                        <h3 className="font-bold mb-4">پیش‌نمایش گزارش</h3>
                        {pivotData ? (
                             <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                                        <tr>{pivotData.headers.map(h => <th key={h} className="p-2 text-right">{h}</th>)}</tr>
                                    </thead>
                                    <tbody>
                                        {pivotData.data.map((row, index) => (
                                            <tr key={index} className="border-b dark:border-gray-700">
                                                {pivotData.headers.map(h => (
                                                    <td key={h} className="p-2 font-mono text-right">{typeof row[h] === 'number' ? row[h].toLocaleString('fa-IR') : row.rowHeader}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <p className="text-gray-500 text-center pt-10">برای ساخت گزارش، فیلدها را به قسمت‌های بالا بکشید (حداقل یک سطر و یک مقدار الزامی است).</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};