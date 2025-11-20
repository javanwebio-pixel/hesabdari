import React, { useEffect } from 'react';
import type { ToastData } from '../../types';
import { IconCheckCircle, IconXCircle, IconClock } from '../Icons';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: <IconCheckCircle className="w-6 h-6 text-green-500" />,
    bg: 'bg-white dark:bg-gray-800',
    borderColor: 'border-green-500',
  },
  error: {
    icon: <IconXCircle className="w-6 h-6 text-red-500" />,
    bg: 'bg-white dark:bg-gray-800',
    borderColor: 'border-red-500',
  },
  info: {
    icon: <IconClock className="w-6 h-6 text-blue-500" />,
    bg: 'bg-white dark:bg-gray-800',
    borderColor: 'border-blue-500',
  },
};

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [toast.id, onDismiss]);
  
  const config = toastConfig[toast.type];

  return (
    <div className={`flex items-center w-full max-w-sm p-4 text-gray-700 dark:text-gray-200 ${config.bg} rounded-lg shadow-lg border-r-4 ${config.borderColor} transition-all transform animate-fade-in-right`}>
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8">
        {config.icon}
      </div>
      <div className="mr-3 text-sm font-normal">{toast.message}</div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="mr-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
        aria-label="بستن"
      >
        <span className="sr-only">بستن</span>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
      </button>
    </div>
  );
};


export const ToastContainer: React.FC<{ toasts: ToastData[]; onDismiss: (id: string) => void }> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-20 left-6 z-50 space-y-4">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};