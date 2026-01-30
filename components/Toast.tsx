import React, { useEffect } from 'react';
import { NotificationState } from '../types';
import { Bell, CheckCircle2, Zap } from './Icons';

interface ToastProps {
  notification: NotificationState;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.show, onClose]);

  if (!notification.show) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center z-[70] px-4 pointer-events-none">
      <div className="bg-navy-900/95 text-white p-4 rounded-2xl shadow-xl flex items-center gap-4 max-w-sm w-full backdrop-blur-md animate-toast-up pointer-events-auto border border-navy-800">
        <div className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center flex-shrink-0 border border-navy-700">
           {notification.type === 'success' && <CheckCircle2 className="text-green-400 w-6 h-6" />}
           {notification.type === 'alert' && <Bell className="text-orange-500 w-6 h-6" />}
           {notification.type === 'info' && <Zap className="text-blue-400 w-6 h-6" />}
        </div>
        <div className="flex-1">
            <h4 className="font-bold text-sm">{notification.message}</h4>
            {notification.subtext && <p className="text-xs text-gray-300 mt-0.5">{notification.subtext}</p>}
        </div>
      </div>
      <style>{`
        @keyframes toast-up {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .animate-toast-up {
            animation: toast-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Toast;