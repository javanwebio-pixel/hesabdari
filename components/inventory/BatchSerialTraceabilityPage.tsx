
import React, { useState } from 'react';
import type { Batch, SerialNumber } from '../../types';
import { IconSearch, IconFileText, IconShoppingCart, IconBuildingStore } from '../Icons';

interface BatchSerialTraceabilityPageProps {
    batches: Batch[];
    serialNumbers: SerialNumber[];
}

const TimelineItem: React.FC<{ icon: React.ReactNode; title: string; date: string; children: React.ReactNode }> = ({ icon, title, date, children }) => (
    <li className="mb-6 ms-6">            
        <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -start-4 ring-4 ring-white dark:ring-gray-800 dark:bg-blue-900">
            {icon}
        </span>
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600">
            <div className="items-center justify-between mb-3 sm:flex">
                <div className="text-sm font-normal text-gray-500 lex dark:text-gray-300">{date}</div>
            </div>
            <div className="p-3 text-sm font-semibold text-gray-900 bg-gray-50 rounded-lg dark:bg-gray-600 dark:text-white">{title}</div>
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">{children}</div>
        </div>
    </li>
);

export const BatchSerialTraceabilityPage: React.FC<BatchSerialTraceabilityPageProps> = ({ batches, serialNumbers }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [result, setResult] = useState<any>(null);

    const handleSearch = () => {
        if (searchTerm.startsWith('BAT-')) {
            const batch = batches.find(b => b.batchNumber === searchTerm);
            setResult({ type: 'batch', data: batch });
        } else if (searchTerm.startsWith('SN-')) {
            const serial = serialNumbers.find(s => s.serialNumber === searchTerm);
            setResult({ type: 'serial', data: serial });
        } else {
            setResult(null);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">ردیابی بچ و شماره سریال</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex gap-2">
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        placeholder="شماره بچ (BAT-...) یا شماره سریال (SN-...) را وارد کنید"
                        className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                    />
                    <button onClick={handleSearch} className="px-4 py-2 bg-primary text-white rounded-lg"><IconSearch/></button>
                </div>
            </div>
            {result && result.data && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                     <h3 className="text-lg font-bold mb-4">تاریخچه: {searchTerm} ({result.data.goodName})</h3>
                     <ol className="relative border-s border-gray-200 dark:border-gray-600">                  
                        {result.type === 'batch' && (
                            <TimelineItem icon={<IconFileText className="w-5 h-5 text-blue-800 dark:text-blue-300"/>} title="ایجاد بچ در رسید انبار" date={result.data.manufactureDate}>
                                رسید شماره 5001 - تعداد: {result.data.quantity} - موقعیت اولیه: {result.data.location}
                            </TimelineItem>
                        )}
                         {result.type === 'serial' && (
                            <>
                            <TimelineItem icon={<IconBuildingStore className="w-5 h-5 text-blue-800 dark:text-blue-300"/>} title="خروج از انبار" date="۱۴۰۳/۰۶/۱۵">
                                حواله خروج شماره DN-201 برای مشتری آلفا
                            </TimelineItem>
                            <TimelineItem icon={<IconFileText className="w-5 h-5 text-blue-800 dark:text-blue-300"/>} title="ایجاد شماره سریال" date="۱۴۰۳/۰۵/۲۰">
                                رسید شماره 5005 - موقعیت اولیه: {result.data.location}
                            </TimelineItem>
                            </>
                        )}
                    </ol>
                </div>
            )}
        </div>
    );
};
