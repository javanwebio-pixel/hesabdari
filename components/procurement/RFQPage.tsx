
import React, { useState, useMemo } from 'react';
import type { RFQ, PurchaseRequest, Party, Good, ToastData, SupplierQuote } from '../../types';
import { IconPlusCircle, IconEye, IconCheckCircle, IconCurrencyDollar } from '../Icons';
import { Modal } from '../common/Modal';

interface RFQPageProps {
    rfqs: RFQ[];
    purchaseRequests: PurchaseRequest[];
    suppliers: Party[];
    goods: Good[];
    showToast: (message: string, type?: ToastData['type']) => void;
}

const RFQViewModal: React.FC<{
    rfq: RFQ;
    onClose: () => void;
    suppliers: Party[];
}> = ({ rfq, onClose, suppliers }) => {
    
    const [quotes, setQuotes] = useState<SupplierQuote[]>(rfq.quotes || []);
    
    const winner = useMemo(() => {
        if (quotes.length === 0) return null;
        return quotes.reduce((min, q) => q.price < min.price ? q : min, quotes[0]);
    }, [quotes]);

    return (
        <Modal isOpen={true} onClose={onClose} title={`استعلام بها شماره ${rfq.rfqNumber}`}>
            <div className="space-y-4 text-sm">
                <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p><strong>تاریخ ایجاد:</strong> {rfq.creationDate}</p>
                    <p><strong>تاریخ بستن:</strong> {rfq.closingDate}</p>
                    <p><strong>وضعیت:</strong> {rfq.status}</p>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">اقلام مورد نیاز:</h4>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                        {rfq.lines.map(line => (
                            <li key={line.id}>{line.goodName} - تعداد: {line.quantity}</li>
                        ))}
                    </ul>
                </div>
                <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">مظنه قیمت تامین‌کنندگان:</h4>
                    <div className="space-y-3">
                        {quotes.map((q, index) => (
                             <div key={index} className={`p-3 rounded-lg border-2 ${q.supplierId === winner?.supplierId ? 'border-green-500 bg-green-50 dark:bg-green-900/50' : 'border-gray-200 dark:border-gray-600'}`}>
                                <div className="flex justify-between items-center">
                                    <p className="font-bold">{q.supplierName}</p>
                                    {q.supplierId === winner?.supplierId && <span className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1"><IconCheckCircle className="w-4 h-4"/> بهترین قیمت</span>}
                                </div>
                                <div className="flex justify-between text-xs mt-2 text-gray-600 dark:text-gray-300">
                                    <span>قیمت کل: <span className="font-mono font-semibold">{q.price.toLocaleString('fa-IR')}</span></span>
                                    <span>زمان تحویل: <span className="font-mono font-semibold">{q.deliveryDays} روز</span></span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    )
}


export const RFQPage: React.FC<RFQPageProps> = ({ rfqs, purchaseRequests, suppliers, goods, showToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewingRFQ, setViewingRFQ] = useState<RFQ | null>(null);
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">استعلام بها (RFQ)</h1>
                <button onClick={() => showToast('این قابلیت در نسخه نمایشی غیرفعال است', 'info')} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary-600 transition-colors">
                    <IconPlusCircle className="w-5 h-5"/> ایجاد استعلام جدید
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3">شماره</th><th className="px-4 py-3">تاریخ ایجاد</th><th className="px-4 py-3">تاریخ بستن</th>
                                <th className="px-4 py-3">PR مرجع</th><th className="px-4 py-3">تعداد مظنه‌ها</th><th className="px-4 py-3">وضعیت</th><th className="px-4 py-3">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rfqs.map(rfq => (
                                <tr key={rfq.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-4 py-2 font-mono">{rfq.rfqNumber}</td>
                                    <td className="px-4 py-2">{rfq.creationDate}</td>
                                    <td className="px-4 py-2">{rfq.closingDate}</td>
                                    <td className="px-4 py-2 font-mono">{purchaseRequests.find(pr=>pr.id === rfq.purchaseRequestId)?.requestNumber}</td>
                                    <td className="px-4 py-2">{rfq.quotes.length}</td>
                                    <td className="px-4 py-2"><span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">{rfq.status}</span></td>
                                    <td className="px-4 py-2"><button onClick={() => setViewingRFQ(rfq)} className="p-1 text-gray-500 hover:text-primary"><IconEye className="w-5 h-5"/></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {viewingRFQ && <RFQViewModal rfq={viewingRFQ} onClose={() => setViewingRFQ(null)} suppliers={suppliers} />}
        </div>
    );
};
