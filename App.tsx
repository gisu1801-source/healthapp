import React, { useState, useEffect } from 'react';
import { parseNaturalLanguageTask } from './services/geminiService';
import { NLPResponse, NotificationState, Task, TaskStatus } from './types';
import AchievementChart from './components/AchievementChart';
import Timeline from './components/Timeline';
import QuickCaptureModal from './components/QuickCaptureModal';
import TaskEditor from './components/TaskEditor';
import ProfileModal from './components/ProfileModal';
import Toast from './components/Toast';
import { Menu, Plus, Search, User, CheckCircle2 } from './components/Icons';

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: '오전 집중 업무',
    startTime: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
    isDeepWork: true,
    category: '업무',
    status: TaskStatus.COMPLETED,
    description: '주간 보고서 작성 및 메일 정리'
  },
  {
    id: '2',
    title: '클라이언트 전략 미팅',
    startTime: new Date(new Date().setHours(13, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    isDeepWork: false,
    category: '미팅',
    status: TaskStatus.PENDING,
    description: 'Q2 마케팅 제안서 인쇄'
  }
];

const App: React.FC = () => {
  // Initialize state from LocalStorage if available
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const savedTasks = localStorage.getItem('soloflow_tasks');
      return savedTasks ? JSON.parse(savedTasks) : INITIAL_TASKS;
    } catch (e) {
      return INITIAL_TASKS;
    }
  });

  const [userName, setUserName] = useState(() => localStorage.getItem('soloflow_username') || '대표님');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [draftTask, setDraftTask] = useState<NLPResponse | null>(null);
  const [notification, setNotification] = useState<NotificationState>({ show: false, message: '', type: 'info' });
  
  // Dynamic Date
  const [todayStr, setTodayStr] = useState('');

  useEffect(() => {
    setTodayStr(new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }));
  }, []);

  // Save to LocalStorage whenever tasks or username change
  useEffect(() => {
    localStorage.setItem('soloflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('soloflow_username', userName);
  }, [userName]);

  // AI Priority Logic
  const priorityTask = tasks
    .filter(t => t.status === TaskStatus.PENDING)
    .sort((a, b) => {
      if (a.isDeepWork && !b.isDeepWork) return -1;
      if (!a.isDeepWork && b.isDeepWork) return 1;
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    })[0];

  const handleNLPInput = async (input: string) => {
    setIsProcessing(true);
    const result = await parseNaturalLanguageTask(input);
    setDraftTask(result);
    setIsProcessing(false);
    setIsModalOpen(false);
    setIsEditorOpen(true);
  };

  const saveTask = (partialTask: Partial<Task>) => {
    if (!draftTask) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: partialTask.title || draftTask.title,
      startTime: partialTask.startTime || new Date().toISOString(),
      endTime: partialTask.endTime || new Date().toISOString(),
      isDeepWork: partialTask.isDeepWork ?? draftTask.isDeepWork,
      category: partialTask.category || draftTask.category,
      status: TaskStatus.PENDING,
      description: partialTask.description || draftTask.description || ''
    };

    setTasks(prev => [...prev, newTask]);
    setIsEditorOpen(false);
    setDraftTask(null);

    setNotification({
      show: true,
      type: 'success',
      message: `"${newTask.title}" 등록 완료`,
      subtext: '10분 전에 알려드릴게요.'
    });

    setTimeout(() => {
      setNotification({
        show: true,
        type: 'alert',
        message: '다가오는 일정: ' + newTask.title,
        subtext: newTask.description ? `준비물: ${newTask.description}` : '준비물을 확인하세요.'
      });
    }, 6000); 
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const newStatus = t.status === TaskStatus.PENDING ? TaskStatus.COMPLETED : TaskStatus.PENDING;
        // Show brief toast only when completing
        if (newStatus === TaskStatus.COMPLETED) {
            setNotification({ show: true, type: 'success', message: '고생하셨습니다! 🎉', subtext: '오늘의 목표에 한 걸음 더 다가갔어요.' });
        }
        return { ...t, status: newStatus };
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
      if (window.confirm('이 일정을 삭제하시겠습니까?')) {
          setTasks(prev => prev.filter(t => t.id !== id));
          setNotification({ show: true, type: 'info', message: '일정이 삭제되었습니다.' });
      }
  };

  const completedCount = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;

  return (
    <div className="min-h-screen flex justify-center bg-gray-100 font-sans text-navy-900">
      <div className="w-full max-w-md bg-gray-background min-h-screen sm:shadow-2xl sm:my-8 sm:rounded-[3rem] relative overflow-hidden flex flex-col">
        
        {/* Header */}
        <header className="px-6 pt-12 pb-4 flex justify-between items-center bg-gray-background z-10 sticky top-0">
            <div>
                <p className="text-gray-500 text-sm font-medium">{todayStr}</p>
                <h1 className="text-2xl font-bold mt-1 text-navy-900 leading-tight">
                    안녕하세요, <br />
                    <span className="text-orange-500">{userName}!</span>
                </h1>
            </div>
            <div 
                onClick={() => setIsProfileOpen(true)}
                className="w-12 h-12 rounded-full border-2 border-orange-200 p-0.5 bg-white shadow-sm cursor-pointer hover:scale-105 transition-transform active:scale-95"
            >
                <div className="w-full h-full rounded-full bg-navy-100 flex items-center justify-center text-navy-900">
                    <User className="w-6 h-6" />
                </div>
            </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar">
            {/* Dashboard Chart */}
            <section className="mt-4">
                <AchievementChart completed={completedCount} total={tasks.length} />
            </section>

            {/* AI Recommendation */}
            <section className="mt-8">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <span className="text-orange-500">✨</span> AI 우선순위 추천
                    </h2>
                    {priorityTask && (
                         <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                            지금 가장 중요
                         </span>
                    )}
                </div>
                
                {priorityTask ? (
                    <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-orange-500 flex items-center justify-between transition-all hover:shadow-md cursor-pointer" onClick={() => toggleTaskStatus(priorityTask.id)}>
                        <div>
                             <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase ${priorityTask.isDeepWork ? 'bg-navy-100 text-navy-800' : 'bg-gray-100 text-gray-600'}`}>
                                    {priorityTask.category}
                                </span>
                                {priorityTask.isDeepWork && <span className="text-[10px] font-bold text-orange-600">Deep Work</span>}
                             </div>
                             <h3 className="font-bold text-gray-800 text-lg">{priorityTask.title}</h3>
                             <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                {priorityTask.description || "추가 메모가 없습니다."}
                             </p>
                        </div>
                        <div className="flex flex-col items-center justify-center bg-gray-50 p-2 rounded-lg min-w-[3.5rem]">
                            <span className="text-xs font-bold text-navy-900">
                                {new Date(priorityTask.startTime).getHours()}:
                                {new Date(priorityTask.startTime).getMinutes().toString().padStart(2, '0')}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                        <h3 className="font-bold text-gray-800">모든 중요 업무 완료!</h3>
                        <p className="text-xs text-gray-500 mt-1">남은 하루는 휴식을 취하거나<br/>내일 일정을 미리 계획해보세요.</p>
                    </div>
                )}
            </section>

            {/* Timeline */}
            <Timeline tasks={tasks} onToggleStatus={toggleTaskStatus} onDelete={deleteTask} />
        </main>

        {/* Floating Action Button */}
        <div className="absolute bottom-24 right-6 z-30">
            <button 
                onClick={() => setIsModalOpen(true)}
                className="w-16 h-16 bg-orange-500 rounded-full shadow-lg shadow-orange-500/40 flex items-center justify-center text-white hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all"
            >
                <Plus className="w-8 h-8" />
            </button>
        </div>

        {/* Bottom Nav */}
        <nav className="absolute bottom-0 w-full bg-white border-t border-gray-100 pb-6 pt-4 px-8 flex justify-between items-center z-20 rounded-b-[3rem]">
            <button className="flex flex-col items-center gap-1 text-orange-500">
                <div className="p-1 rounded-xl bg-orange-50">
                    <Menu className="w-6 h-6" />
                </div>
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-navy-900 transition">
                <Search className="w-6 h-6" />
            </button>
            <div className="w-8"></div> {/* Spacer for FAB */}
            <button 
                onClick={() => setIsProfileOpen(true)}
                className="flex flex-col items-center gap-1 text-gray-400 hover:text-navy-900 transition"
            >
                <User className="w-6 h-6" />
            </button>
        </nav>

        {/* Modals & Overlays */}
        <QuickCaptureModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleNLPInput}
            isProcessing={isProcessing}
        />

        <TaskEditor 
            draft={draftTask}
            onSave={saveTask}
            onCancel={() => {
                setIsEditorOpen(false);
                setDraftTask(null);
            }}
        />

        <ProfileModal 
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            currentName={userName}
            onSave={(newName) => {
                setUserName(newName);
                setIsProfileOpen(false);
                setNotification({ show: true, type: 'success', message: '프로필이 업데이트되었습니다.' });
            }}
        />

        <Toast 
            notification={notification} 
            onClose={() => setNotification(prev => ({ ...prev, show: false }))} 
        />
        
      </div>
    </div>
  );
};

export default App;