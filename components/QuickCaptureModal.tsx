import React, { useState, useEffect, useRef } from 'react';
import { Mic, Zap, X, Clock } from './Icons';

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: string) => void;
  isProcessing: boolean;
}

const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({ isOpen, onClose, onSubmit, isProcessing }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setInput('');
      setIsListening(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input);
    }
  };

  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
      return;
    }

    // @ts-ignore - TS doesn't fully support SpeechRecognition types out of the box without config
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'ko-KR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
    };

    recognition.start();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm pointer-events-auto transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl transform transition-transform duration-300 ease-out pointer-events-auto mb-0 sm:mb-8 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <div>
             <h2 className="text-xl font-bold text-navy-900">빠른 일정 등록</h2>
             <p className="text-sm text-gray-400">다음 집중할 일은 무엇인가요?</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "듣고 있습니다..." : "예: 내일 오후 3시 마케팅 회의 1시간 동안 진행..."}
              className={`w-full h-32 p-4 bg-gray-50 rounded-2xl text-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none transition-colors ${isListening ? 'ring-2 ring-red-400 bg-red-50' : ''}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="absolute bottom-3 right-3 flex gap-2">
                <button 
                  type="button" 
                  onClick={handleMicClick}
                  className={`p-2 transition-all rounded-full ${isListening ? 'text-white bg-red-500 animate-pulse scale-110' : 'text-gray-400 hover:text-navy-900'}`}
                >
                    <Mic className="w-5 h-5" />
                </button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-2">
                <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded-lg flex items-center gap-1">
                    <Zap className="w-3 h-3" /> AI 자동 분석
                </span>
            </div>
            
            <button
              type="button" // Prevent default form submit to allow handler logic
              onClick={handleSubmit}
              disabled={!input.trim() || isProcessing}
              className={`
                px-6 py-3 rounded-xl font-bold text-white shadow-lg flex items-center gap-2 transition-all
                ${!input.trim() || isProcessing ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 active:scale-95'}
              `}
            >
              {isProcessing ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" /> 분석 중...
                </>
              ) : (
                '일정 생성'
              )}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default QuickCaptureModal;