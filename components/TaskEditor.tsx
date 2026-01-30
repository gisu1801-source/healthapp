import React, { useState, useEffect } from 'react';
import { NLPResponse, Task } from '../types';
import { Bell, BellOff, Calendar, Clock, CheckCircle2, Briefcase } from './Icons';

interface TaskEditorProps {
  draft: NLPResponse | null;
  onSave: (task: Partial<Task>) => void;
  onCancel: () => void;
}

const TaskEditor: React.FC<TaskEditorProps> = ({ draft, onSave, onCancel }) => {
  const [isDeepWork, setIsDeepWork] = useState(draft?.isDeepWork || false);
  const [startTime, setStartTime] = useState(draft?.startTime || new Date().toISOString());
  const [endTime, setEndTime] = useState(draft?.endTime || new Date(Date.now() + 3600000).toISOString());
  const [title, setTitle] = useState(draft?.title || "");
  const [description, setDescription] = useState(draft?.description || "");
  const [aiTip, setAiTip] = useState("");

  useEffect(() => {
    // Generate simple dynamic insight
    const hour = new Date(startTime).getHours();
    if (isDeepWork) {
        setAiTip("방해 금지 모드로 설정되었습니다. 스마트폰 알림을 꺼두시면 더 좋습니다.");
    } else if (hour >= 13 && hour <= 15) {
        setAiTip("식곤증이 올 수 있는 시간대입니다. 가벼운 미팅이나 단순 업무가 적합해요.");
    } else if (hour >= 9 && hour <= 11) {
        setAiTip("뇌가 가장 맑은 시간입니다. 중요한 의사결정을 하기에 좋습니다.");
    } else {
        setAiTip("무리하지 마시고 적절한 휴식 시간을 포함해서 계획하세요.");
    }
  }, [startTime, isDeepWork]);

  if (!draft) return null;

  const handleSave = () => {
    onSave({
      title,
      startTime,
      endTime,
      isDeepWork,
      category: draft.category,
      description,
    });
  };

  // Helper to format for input type="datetime-local"
  const toLocalISO = (isoString: string) => {
    const d = new Date(isoString);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  };

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    const d = new Date(value);
    if (type === 'start') setStartTime(d.toISOString());
    else setEndTime(d.toISOString());
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-50 sm:bg-black/20 backdrop-blur-sm">
      <div className="w-full max-w-md h-full sm:h-auto bg-white sm:rounded-3xl p-6 flex flex-col shadow-2xl overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <button onClick={onCancel} className="text-gray-500 font-medium hover:text-navy-900">취소</button>
            <h2 className="text-lg font-bold text-navy-900">일정 검토</h2>
            <div className="w-12"></div>
        </div>

        <div className="flex-1 space-y-5">
            {/* Title Input */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">일정 제목</label>
                <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-2xl font-bold text-navy-900 border-b-2 border-gray-100 focus:border-orange-500 focus:outline-none pb-2 bg-transparent"
                />
            </div>

            {/* Description/Memo Input */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">준비물 / 메모</label>
                <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100 focus-within:ring-1 focus-within:ring-orange-500">
                    <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input 
                        type="text" 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="필요한 준비물을 입력하세요"
                        className="w-full bg-transparent text-sm text-gray-800 focus:outline-none"
                    />
                </div>
            </div>

            {/* Time Blocking */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 mb-2 text-orange-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">시작</span>
                    </div>
                    <input 
                        type="datetime-local" 
                        value={toLocalISO(startTime)}
                        onChange={(e) => handleTimeChange('start', e.target.value)}
                        className="w-full bg-transparent font-semibold text-gray-800 text-sm focus:outline-none"
                    />
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 mb-2 text-orange-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">종료</span>
                    </div>
                    <input 
                        type="datetime-local" 
                        value={toLocalISO(endTime)}
                        onChange={(e) => handleTimeChange('end', e.target.value)}
                        className="w-full bg-transparent font-semibold text-gray-800 text-sm focus:outline-none"
                    />
                </div>
            </div>

            {/* Deep Work Toggle */}
            <div 
                className={`
                    p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-colors border
                    ${isDeepWork ? 'bg-navy-900 border-navy-800' : 'bg-white border-gray-200'}
                `}
                onClick={() => setIsDeepWork(!isDeepWork)}
            >
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${isDeepWork ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {isDeepWork ? <BellOff className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
                    </div>
                    <div>
                        <h3 className={`font-bold ${isDeepWork ? 'text-white' : 'text-gray-800'}`}>몰입 모드 (Deep Work)</h3>
                        <p className={`text-xs ${isDeepWork ? 'text-gray-300' : 'text-gray-500'}`}>
                            {isDeepWork ? '알림 차단' : '기본 알림'}
                        </p>
                    </div>
                </div>
                <div className={`
                    w-12 h-7 rounded-full p-1 transition-colors relative
                    ${isDeepWork ? 'bg-orange-500' : 'bg-gray-200'}
                `}>
                    <div className={`
                        w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200
                        ${isDeepWork ? 'translate-x-5' : 'translate-x-0'}
                    `}></div>
                </div>
            </div>
            
            {/* AI Insight */}
            <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-bold text-sm text-blue-800">스마트 일정 팁</h4>
                    <p className="text-xs text-blue-600 mt-1">
                        {aiTip}
                    </p>
                </div>
            </div>
        </div>

        {/* Action Button */}
        <div className="mt-6">
            <button 
                onClick={handleSave}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
                <CheckCircle2 className="w-5 h-5" />
                일정 확정
            </button>
        </div>
      </div>
    </div>
  );
};

export default TaskEditor;