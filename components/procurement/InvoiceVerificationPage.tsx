

import React, { useState, useMemo } from 'react';
import type { SupplierInvoice, PurchaseOrder, GoodsReceipt, ToastData } from '../../types';
import { IconCheckCircle, IconXCircle, IconFileText } from '../Icons';
import { Modal } from '../common/Modal';

interface InvoiceVerificationPageProps {
    supplierInvoices: SupplierInvoice[];
    purchaseOrders: PurchaseOrder[];
    goodsReceipts: GoodsReceipt[];
    showToast: (message: string, type?: ToastData['type']) => void;
}

const VerificationModal: React.FC<{
    invoice: SupplierInvoice;
    po: PurchaseOrder | undefined;
    gr: GoodsReceipt | undefined;
    onClose: () => void;
    onPost: (invoiceId: string) => void;
}> = ({ invoice, po, gr, onClose, onPost }) => {

    const lineItems = useMemo(() => {
        const allItems = new Set([...(po?.lines.map(l => l.goodId) || []), ...(gr?.lines.map(l => l.goodId) || [])]);
        return Array.from(allItems).map(goodId => {
            const poLine = po?.lines.find(l => l.goodId === goodId);
            const grLine = gr?.lines.find(l => l.goodId === goodId);
            // In a real app, you'd match invoice lines too. We'll simplify here.
            
            const qtyMatch = poLine?.quantity === grLine?.quantityReceived;
            
            return {
                goodId: goodId,
                goodName: poLine?.goodName,
                poQty: poLine?.quantity,
                grQty: grLine?.quantityReceived,
                invQty: poLine?.quantity, // Assuming invoice matches PO for simplicity
                poPrice: poLine?.price,
                invPrice: poLine?.price, // Assuming price matches PO
                qtyMatch,
            };
        });
    }, [po, gr, invoice]);

    return (
        <Modal isOpen={true} onClose={onClose} title={`تطبیق فاکتور ${invoice.invoiceNumber}`}>
            <div className="space-y-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="p-2 text-right">کالا</th>
                                <th className="p-2 text-center">تعداد PO</th>
                                <th className="p-2 text-center">تعداد GR</th>
                                <th className="p-2 text-center">تعداد فاکتور</th>
                                <th className="p-2 text-center">وضعیت</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lineItems.map(item => (
                                <tr key={item.goodId} className="border-b dark:border-gray-700">
                                    <td className="p-2 font-semibold">{item.goodName}</td>
                                    <td className="p-2 text-center font-mono">{item.poQty}</td>
                                    <td className="p-2 text-center font-mono">{item.grQty}</td>
                                    <td className="p-2 text-center font-mono">{item.invQty}</td>
                                    <td className="p-2 text-center">
                                        {item.qtyMatch ? 
                                            <IconCheckCircle className="w-5 h-5 text-success mx-auto" /> :
                                            <IconXCircle className="w-5 h-5 text-danger mx-auto" title="مغایرت در تعداد" />
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
                    <button onClick={onClose} className="btn-secondary">بستن</button>
                    <button onClick={() => onPost(invoice.id)} disabled={!lineItems.every(l=>l.qtyMatch)} className="btn-primary disabled:opacity-50">تایید و ارسال به پرداخت</button>
                </div>
            </div>
        </Modal>
    )
}

export const InvoiceVerificationPage: React.FC<InvoiceVerificationPageProps> = ({ supplierInvoices, purchaseOrders, goodsReceipts, showToast }) => {
    // FIX: Update the state type for 'verifyingInvoice' to include the 'po' and 'gr' properties that are added in 'invoicesToVerify'.
    const [verifyingInvoice, setVerifyingInvoice] = useState<(SupplierInvoice & { po: PurchaseOrder | undefined; gr: GoodsReceipt | undefined; }) | null>(null);

    const invoicesToVerify = useMemo(() => {
        const grPoMap = new Map(goodsReceipts.map(gr => [gr.purchaseOrderId, gr]));
        return supplierInvoices
            .filter(inv => inv.status === 'ثبت شده' && inv.paidAmount === 0 && grPoMap.has(inv.purchaseOrderId || ''))
            .map(inv => ({
                ...inv,
                po: purchaseOrders.find(po => po.id === inv.purchaseOrderId),
                gr: grPoMap.get(inv.purchaseOrderId || ''),
            }));
    }, [supplierInvoices, purchaseOrders, goodsReceipts]);

    const handlePost = (invoiceId: string) => {
        showToast(`فاکتور ${verifyingInvoice?.invoiceNumber} تایید و برای پرداخت ارسال شد.`);
        setVerifyingInvoice(null);
        // Here you would update the invoice status in a real app
    };
    
    return (
        <div className="space-y-6">
            <style>{`.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">میزکار تطبیق فاکتور خرید</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3">شماره فاکتور</th><th className="px-4 py-3">تامین کننده</th>
                                <th className="px-4 py-3">تاریخ</th><th className="px-4 py-3">مبلغ</th><th className="px-4 py-3">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoicesToVerify.map(item => (
                                <tr key={item.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-4 py-2 font-mono">{item.invoiceNumber}</td>
                                    <td className="px-4 py-2 font-semibold">{item.supplierName}</td>
                                    <td className="px-4 py-2">{item.invoiceDate}</td>
                                    <td className="px-4 py-2 font-mono">{item.totalAmount.toLocaleString('fa-IR')}</td>
                                    <td className="px-4 py-2">
                                        <button onClick={() => setVerifyingInvoice(item)} className="btn-secondary text-xs px-3 py-1">تطبیق</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {verifyingInvoice && <VerificationModal invoice={verifyingInvoice} po={verifyingInvoice.po} gr={verifyingInvoice.gr} onClose={() => setVerifyingInvoice(null)} onPost={handlePost} />}
        </div>
    );
};