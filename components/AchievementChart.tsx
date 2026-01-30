import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Zap } from './Icons';

interface AchievementChartProps {
  completed: number;
  total: number;
}

const AchievementChart: React.FC<AchievementChartProps> = ({ completed, total }) => {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  const data = [
    { name: '완료', value: completed },
    { name: '남음', value: total - completed },
  ];

  const COLORS = ['#1A237E', '#E0E0E0']; // Navy and Light Gray

  // Dynamic message logic
  let message = "오늘의 목표를 시작해보세요!";
  let subMessageClass = "text-gray-500";
  
  if (percentage > 0 && percentage < 50) {
    message = "좋은 출발입니다! 힘내세요.";
    subMessageClass = "text-orange-500";
  } else if (percentage >= 50 && percentage < 80) {
    message = "벌써 절반 이상 해내셨군요!";
    subMessageClass = "text-blue-600";
  } else if (percentage >= 80 && percentage < 100) {
    message = "마무리가 눈앞에 있습니다!";
    subMessageClass = "text-navy-900";
  } else if (percentage === 100 && total > 0) {
    message = "오늘 업무 완벽 클리어! 🎉";
    subMessageClass = "text-green-600";
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <h2 className="text-navy-900 font-bold text-lg">오늘의 달성률</h2>
        <p className={`text-sm mt-1 font-medium ${subMessageClass}`}>
          {message}
        </p>
        <div className="mt-4 flex items-center gap-2">
           <Zap className="text-orange-500 w-5 h-5 fill-current" />
           <span className="text-3xl font-bold text-navy-900">{percentage}%</span>
           <span className="text-gray-400 text-sm font-medium self-end mb-1">완료</span>
        </div>
      </div>
      
      <div className="h-24 w-24 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={45}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
              cornerRadius={10}
              paddingAngle={5}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AchievementChart;