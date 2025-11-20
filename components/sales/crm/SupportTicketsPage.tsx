import React, { useState, useMemo } from 'react';
import type { SupportTicket, TicketStatus, TicketPriority, Party, ToastData, TicketReply } from '../../../types';
import { IconPlusCircle, IconSearch } from '../../Icons';
import { Modal } from '../../common/Modal';

const statusMap: { [key in TicketStatus]: { class: string } } = {
    'جدید': { class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    'در حال بررسی': { class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
    'در انتظار پاسخ مشتری': { class: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
    'حل شده': { class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    'بسته شده': { class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
};

const priorityMap: { [key in TicketPriority]: { class: string } } = {
    'کم': { class: 'text-gray-500' },
    'متوسط': { class: 'text-blue-500' },
    'زیاد': { class: 'text-orange-500' },
    'فوری': { class: 'text-red-500 font-bold' },
};

const NewTicketFormModal: React.FC<{
    isOpen: boolean; onClose: () => void;
    onSave: (ticket: Omit<SupportTicket, 'id'|'ticketNumber'>) => void;
    parties: Party[];
}> = ({ isOpen, onClose, onSave, parties }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const customerId = formData.get('customerId') as string;
        const customer = parties.find(p => p.id === customerId);
        if(!customer) return;

        const newTicket: Omit<SupportTicket, 'id'|'ticketNumber'> = {
            subject: formData.get('subject') as string,
            description: formData.get('description') as string,
            customerId,
            customerName: customer.name,
            createdDate: new Date().toLocaleDateString('fa-IR-u-nu-latn'),
            status: 'جدید',
            priority: formData.get('priority') as TicketPriority,
            assignedTo: formData.get('assignedTo') as string,
            replies: [],
        };
        onSave(newTicket);
        onClose();
    };
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="ثبت تیکت پشتیبانی جدید">
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="subject" required placeholder="موضوع تیکت" className="input-field w-full"/>
                <select name="customerId" required className="input-field w-full">
                    <option value="">انتخاب مشتری...</option>
                    {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <textarea name="description" required rows={4} placeholder="شرح کامل مشکل..." className="input-field w-full"></textarea>
                <div className="grid grid-cols-2 gap-4">
                    <select name="priority" defaultValue="متوسط" className="input-field"><option value="کم">کم</option><option value="متوسط">متوسط</option><option value="زیاد">زیاد</option><option value="فوری">فوری</option></select>
                    <input name="assignedTo" placeholder="مسئول رسیدگی" className="input-field"/>
                </div>
                <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={onClose} className="btn-secondary">لغو</button><button type="submit" className="btn-primary">ایجاد تیکت</button></div>
            </form>
        </Modal>
    );
};

const TicketViewModal: React.FC<{
    ticket: SupportTicket;
    onClose: () => void;
    onAddReply: (ticketId: string, reply: Omit<TicketReply, 'id'>) => void;
    onUpdateTicket: (ticket: SupportTicket) => void;
}> = ({ ticket, onClose, onAddReply, onUpdateTicket }) => {
    const [reply, setReply] = useState('');
    return (
        <Modal isOpen={!!ticket} onClose={onClose} title={`تیکت #${ticket.ticketNumber}: ${ticket.subject}`}>
            <div className="space-y-4 text-sm">
                <p className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">{ticket.description}</p>
                <div className="max-h-60 overflow-y-auto space-y-3 p-2">
                    {ticket.replies?.map(r => (
                        <div key={r.id} className={`p-3 rounded-lg ${r.author === 'customer' ? 'bg-blue-50 dark:bg-blue-900/50' : 'bg-gray-100 dark:bg-gray-700'}`}>
                            <p className="font-semibold">{r.author} <span className="text-xs text-gray-500">({r.date})</span></p>
                            <p>{r.message}</p>
                        </div>
                    ))}
                </div>
                <div>
                    <textarea value={reply} onChange={e => setReply(e.target.value)} rows={3} placeholder="پاسخ خود را بنویسید..." className="input-field w-full"></textarea>
                    <button onClick={() => { onAddReply(ticket.id, { author: 'پشتیبان', message: reply, date: new Date().toLocaleDateString('fa-IR-u-nu-latn') }); setReply(''); }} className="btn-primary mt-2">ارسال پاسخ</button>
                </div>
            </div>
        </Modal>
    );
};

interface SupportTicketsPageProps {
    tickets: SupportTicket[];
    parties: Party[];
    onUpdateTicket: (ticket: SupportTicket) => void;
    onAddTicket: (ticket: Omit<SupportTicket, 'id' | 'ticketNumber'>) => void;
    onAddReply: (ticketId: string, reply: Omit<TicketReply, 'id'>) => void;
    showToast: (message: string, type?: ToastData['type']) => void;
}

export const SupportTicketsPage: React.FC<SupportTicketsPageProps> = ({ tickets, parties, onUpdateTicket, onAddTicket, onAddReply, showToast }) => {
    const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
    const [viewingTicket, setViewingTicket] = useState<SupportTicket | null>(null);
    const [filters, setFilters] = useState({ search: '', status: 'all', priority: 'all' });

    const filteredTickets = useMemo(() => {
        return tickets.filter(t => 
            (t.subject.toLowerCase().includes(filters.search.toLowerCase()) || String(t.ticketNumber).includes(filters.search)) &&
            (filters.status === 'all' || t.status === filters.status) &&
            (filters.priority === 'all' || t.priority === filters.priority)
        );
    }, [tickets, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSaveNewTicket = (ticket: Omit<SupportTicket, 'id' | 'ticketNumber'>) => {
        onAddTicket(ticket);
        showToast('تیکت جدید با موفقیت ثبت شد.');
    };

    return (
        <div className="space-y-6">
             <style>{`.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:all .2s}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">مرکز خدمات و پشتیبانی</h1>
                <button onClick={() => setIsNewTicketModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary-600 transition-colors">
                    <IconPlusCircle className="w-5 h-5"/> ثبت تیکت جدید
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="relative md:col-span-1"><IconSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input name="search" type="text" placeholder="جستجو شماره یا موضوع..." onChange={handleFilterChange} className="input-field w-full pr-10"/></div>
                    <select name="status" onChange={handleFilterChange} className="input-field"><option value="all">همه وضعیت‌ها</option>{Object.keys(statusMap).map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <select name="priority" onChange={handleFilterChange} className="input-field"><option value="all">همه اولویت‌ها</option>{Object.keys(priorityMap).map(p => <option key={p} value={p}>{p}</option>)}</select>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700"><tr><th className="px-4 py-3">شماره</th><th className="px-4 py-3">موضوع</th><th className="px-4 py-3">مشتری</th><th className="px-4 py-3">تاریخ</th><th className="px-4 py-3">اولویت</th><th className="px-4 py-3">وضعیت</th><th className="px-4 py-3">مسئول</th></tr></thead>
                        <tbody>
                            {filteredTickets.map(t => (
                                <tr key={t.id} onClick={() => setViewingTicket(t)} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
                                    <td className="px-4 py-2 font-mono">{t.ticketNumber}</td>
                                    <td className="px-4 py-2 font-semibold text-gray-800 dark:text-gray-200">{t.subject}</td>
                                    <td className="px-4 py-2">{t.customerName}</td>
                                    <td className="px-4 py-2">{t.createdDate}</td>
                                    <td className={`px-4 py-2 font-semibold ${priorityMap[t.priority].class}`}>{t.priority}</td>
                                    <td className="px-4 py-2"><span className={`px-2 py-1 text-xs rounded-full ${statusMap[t.status].class}`}>{t.status}</span></td>
                                    <td className="px-4 py-2">{t.assignedTo}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {viewingTicket && <TicketViewModal ticket={viewingTicket} onClose={() => setViewingTicket(null)} onAddReply={onAddReply} onUpdateTicket={onUpdateTicket} />}
            <NewTicketFormModal isOpen={isNewTicketModalOpen} onClose={() => setIsNewTicketModalOpen(false)} onSave={handleSaveNewTicket} parties={parties} />
        </div>
    );
};
