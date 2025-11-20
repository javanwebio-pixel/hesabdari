import React, { useState, useMemo } from 'react';
import type { Employee, ToastData } from '../../../types';
import { IconPlusCircle, IconSearch, IconEdit, IconTrash, IconChevronLeft, IconChevronRight } from '../../Icons';
import { Modal } from '../../common/Modal';

const ITEMS_PER_PAGE = 10;

const EmployeeForm: React.FC<{
    onSave: (employee: Omit<Employee, 'id'>) => void;
    onCancel: () => void;
    initialData?: Employee | null;
}> = ({ onSave, onCancel, initialData }) => {
    const isEditing = !!initialData;
    const [formData, setFormData] = useState({
        employeeId: initialData?.employeeId || '',
        fullName: initialData?.fullName || '',
        position: initialData?.position || '',
        department: initialData?.department || '',
        hireDate: initialData?.hireDate ? new Date(initialData.hireDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: initialData?.status || 'فعال',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, avatarUrl: initialData?.avatarUrl || `https://i.pravatar.cc/150?u=${formData.employeeId}` });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div><label className="label-form">شماره پرسنلی</label><input type="text" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} required className="input-field" disabled={isEditing}/></div>
                <div><label className="label-form">نام کامل</label><input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required className="input-field"/></div>
                <div><label className="label-form">سمت</label><input type="text" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="input-field"/></div>
                <div><label className="label-form">دپارتمان</label><input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="input-field"/></div>
                <div><label className="label-form">تاریخ استخدام</label><input type="date" value={formData.hireDate} onChange={e => setFormData({...formData, hireDate: e.target.value})} className="input-field"/></div>
                <div><label className="label-form">وضعیت</label><select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="input-field"><option value="فعال">فعال</option><option value="غیرفعال">غیرفعال</option></select></div>
                <div><label className="label-form">ایمیل</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-field"/></div>
                <div><label className="label-form">تلفن</label><input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input-field"/></div>
            </div>
            <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={onCancel} className="btn-secondary">لغو</button><button type="submit" className="btn-primary">ذخیره</button></div>
        </form>
    );
};

interface EmployeeMasterPageProps {
    employees: Employee[];
    onSaveEmployee: (employee: Employee | Omit<Employee, 'id'>) => void;
    showToast: (message: string, type?: ToastData['type']) => void;
}

export const EmployeeMasterPage: React.FC<EmployeeMasterPageProps> = ({ employees, onSaveEmployee, showToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const filteredEmployees = useMemo(() => employees.filter(e => e.fullName.includes(searchTerm) || e.employeeId.includes(searchTerm)), [employees, searchTerm]);
    const paginatedEmployees = useMemo(() => filteredEmployees.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [filteredEmployees, currentPage]);
    const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);

    const handleSave = (employee: Employee | Omit<Employee, 'id'>) => {
        onSaveEmployee(employee);
        showToast(`اطلاعات ${employee.fullName} با موفقیت ذخیره شد.`);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">پرونده پرسنلی</h1>
                <button onClick={() => { setEditingEmployee(null); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2"><IconPlusCircle /> کارمند جدید</button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="relative mb-4"><IconSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" placeholder="جستجو نام یا شماره پرسنلی..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pr-10 pl-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border"/></div>
                <table className="w-full text-sm">
                    <thead><tr className="text-right text-xs uppercase bg-gray-50 dark:bg-gray-700"><th>کارمند</th><th>سمت</th><th>دپارتمان</th><th>تاریخ استخدام</th><th>وضعیت</th><th></th></tr></thead>
                    <tbody>
                        {paginatedEmployees.map(emp => (
                            <tr key={emp.id} className="border-b dark:border-gray-700">
                                <td className="p-2 flex items-center gap-3"><img src={emp.avatarUrl} className="w-10 h-10 rounded-full"/><div><p className="font-semibold">{emp.fullName}</p><p className="text-xs text-gray-500">{emp.employeeId}</p></div></td>
                                <td className="p-2">{emp.position}</td><td className="p-2">{emp.department}</td><td className="p-2">{emp.hireDate}</td>
                                <td className="p-2"><span className={`px-2 py-1 text-xs rounded-full ${emp.status === 'فعال' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{emp.status}</span></td>
                                <td className="p-2"><button onClick={() => { setEditingEmployee(emp); setIsModalOpen(true); }} className="text-blue-500 p-1"><IconEdit/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 <div className="flex justify-between items-center mt-4 text-sm"><p>نمایش {paginatedEmployees.length} از {filteredEmployees.length}</p><div className="flex items-center gap-1"><button onClick={() => setCurrentPage(p=>p-1)} disabled={currentPage===1} className="p-2 disabled:opacity-50"><IconChevronRight/></button><span>{currentPage} از {totalPages}</span><button onClick={() => setCurrentPage(p=>p+1)} disabled={currentPage===totalPages} className="p-2 disabled:opacity-50"><IconChevronLeft/></button></div></div>
            </div>
            {isModalOpen && <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEmployee ? 'ویرایش کارمند' : 'کارمند جدید'}><EmployeeForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} initialData={editingEmployee} /></Modal>}
        </div>
    );
};
