import React, { useState, useEffect } from 'react';
import { User, X, CheckCircle2 } from './Icons';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onSave: (name: string) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, currentName, onSave }) => {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    setName(currentName);
  }, [currentName, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative z-10 shadow-2xl animate-scale-up">
        <button onClick={onClose} className="absolute right-4 top-4 p-2 text-gray-400 hover:text-navy-900 rounded-full hover:bg-gray-50 transition-colors">
            <X className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col items-center mb-6 pt-2">
            <div className="w-24 h-24 rounded-full bg-navy-50 flex items-center justify-center text-navy-900 mb-4 border-4 border-white shadow-lg relative group cursor-pointer overflow-hidden">
                <User className="w-10 h-10 text-navy-800" />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs font-bold text-white">Edit</span>
                </div>
            </div>
            <h2 className="text-xl font-bold text-navy-900">프로필 설정</h2>
            <p className="text-sm text-gray-500">앱에서 나를 부를 호칭을 정해주세요.</p>
        </div>

        <div className="space-y-5">
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">호칭 / 닉네임</label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-500 rounded-2xl p-4 font-bold text-navy-900 text-lg focus:outline-none focus:bg-white transition-all shadow-inner"
                    placeholder="예: 대표님, 작가님, 길동님"
                    autoFocus
                />
            </div>

            <button 
                onClick={() => {
                    if (name.trim()) onSave(name);
                }}
                disabled={!name.trim()}
                className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-navy-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <CheckCircle2 className="w-5 h-5" />
                저장하기
            </button>
        </div>
      </div>
       <style>{`
        @keyframes scale-up {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-up {
          animation: scale-up 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default ProfileModal;