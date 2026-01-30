import React from 'react';
import { Task, TaskStatus } from '../types';
import { Clock, BellOff, CheckCircle2, Trash2 } from './Icons';

interface TimelineProps {
  tasks: Task[];
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

const Timeline: React.FC<TimelineProps> = ({ tasks, onToggleStatus, onDelete }) => {
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: false });
  };

  const sortedTasks = [...tasks].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  if (sortedTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
        <div className="bg-gray-200 p-4 rounded-full mb-4">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-navy-900 font-medium">아직 일정이 없습니다</p>
        <p className="text-sm text-gray-500">+ 버튼을 눌러 첫 목표를 등록하세요</p>
      </div>
    );
  }

  return (
    <div className="mt-8 pb-24">
      <h3 className="text-navy-900 font-bold text-lg mb-6 px-1">오늘의 일정</h3>
      <div className="relative pl-4 space-y-6">
        {/* Vertical Line */}
        <div className="absolute left-[23px] top-2 bottom-4 w-0.5 bg-gray-200 -z-10"></div>

        {sortedTasks.map((task, index) => {
          const isDeepWork = task.isDeepWork;
          const isCompleted = task.status === TaskStatus.COMPLETED;
          
          return (
            <div key={task.id} className="relative flex items-start gap-4 group">
              {/* Timeline Node */}
              <div 
                onClick={() => onToggleStatus(task.id)}
                className={`
                w-5 h-5 mt-4 rounded-full border-4 cursor-pointer transition-colors z-10 flex-shrink-0
                ${isCompleted ? 'bg-green-500 border-green-100' : isDeepWork ? 'bg-navy-900 border-gray-50' : 'bg-orange-500 border-gray-50'}
              `}></div>

              {/* Card */}
              <div 
                className={`
                  flex-1 p-4 rounded-xl shadow-sm border transition-all duration-300 relative group-hover:pr-10
                  ${isDeepWork ? 'bg-navy-900 text-white border-navy-800' : 'bg-white text-gray-800 border-gray-100'}
                  ${isCompleted ? 'opacity-60 grayscale' : 'hover:shadow-md hover:scale-[1.01]'}
                `}
              >
                {/* Click area for toggling status */}
                <div className="cursor-pointer" onClick={() => onToggleStatus(task.id)}>
                    <div className="flex justify-between items-start mb-2">
                    <div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md mb-2 inline-block
                        ${isDeepWork ? 'bg-navy-800 text-blue-100' : 'bg-orange-50 text-orange-600'}
                        `}>
                        {task.category}
                        </span>
                        <h4 className={`font-bold text-lg leading-tight ${isCompleted ? 'line-through decoration-2' : ''}`}>
                        {task.title}
                        </h4>
                    </div>
                    {isDeepWork && !isCompleted && <BellOff className="w-4 h-4 text-blue-200" />}
                    {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                    </div>
                    
                    <div className={`flex items-center text-sm ${isDeepWork ? 'text-blue-200' : 'text-gray-500'}`}>
                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                    {formatTime(task.startTime)} - {formatTime(task.endTime)}
                    </div>
                </div>

                {/* Delete Button (visible on hover) */}
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(task.id);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-red-50 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                    title="일정 삭제"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;