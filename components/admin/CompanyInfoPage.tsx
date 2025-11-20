
import React, { useState } from 'react';
import type { CompanyInfo } from '../../types';
import { IconDeviceFloppy } from '../Icons';

interface CompanyInfoPageProps {
    companyInfo: CompanyInfo;
    onSave: (info: CompanyInfo) => void;
}

export const CompanyInfoPage: React.FC<CompanyInfoPageProps> = ({ companyInfo, onSave }) => {
    const [formData, setFormData] = useState<CompanyInfo>(companyInfo);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
             <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.input-field:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-color:hsl(262 83% 58%);box-shadow:0 0 0 2px var(--tw-ring-color)}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:all .2s}`}</style>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">اطلاعات شرکت</h1>
            <form onSubmit={handleSubmit}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <img src={formData.logoUrl} alt="logo" className="w-16 h-16 object-contain bg-gray-100 rounded-full p-2" />
                        <div>
                            <h2 className="text-lg font-bold">{formData.name}</h2>
                            <p className="text-sm text-gray-500">{formData.legalName}</p>
                        </div>
                    </div>
                    <div className="border-t dark:border-gray-700 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="label-form">نام شرکت</label><input name="name" value={formData.name} onChange={handleChange} className="input-field"/></div>
                        <div><label className="label-form">نام حقوقی</label><input name="legalName" value={formData.legalName} onChange={handleChange} className="input-field"/></div>
                        <div><label className="label-form">شناسه ملی</label><input name="nationalId" value={formData.nationalId} onChange={handleChange} className="input-field"/></div>
                        <div><label className="label-form">شماره ثبت</label><input name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} className="input-field"/></div>
                        <div className="md:col-span-2"><label className="label-form">آدرس</label><input name="address" value={formData.address} onChange={handleChange} className="input-field"/></div>
                        <div><label className="label-form">تلفن</label><input name="phone" value={formData.phone} onChange={handleChange} className="input-field"/></div>
                        <div><label className="label-form">ایمیل</label><input name="email" value={formData.email} onChange={handleChange} className="input-field"/></div>
                        <div><label className="label-form">وب‌سایت</label><input name="website" value={formData.website} onChange={handleChange} className="input-field"/></div>
                        <div><label className="label-form">آدرس لوگو</label><input name="logoUrl" value={formData.logoUrl} onChange={handleChange} className="input-field"/></div>
                    </div>
                </div>
                 <div className="flex justify-end pt-4 mt-4">
                    <button type="submit" className="btn-primary flex items-center gap-2">
                        <IconDeviceFloppy className="w-5 h-5" />
                        ذخیره تغییرات
                    </button>
                </div>
            </form>
        </div>
    );
};
