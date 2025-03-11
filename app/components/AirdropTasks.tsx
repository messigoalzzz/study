'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSession } from 'next-auth/react';

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  points: number;
}

const AirdropTasks = () => {
  const wallet = useWallet();
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: '连接钱包',
      description: '连接你的Solana钱包以参与空投',
      completed: false,
      points: 10
    },
    {
      id: 2,
      title: '绑定Twitter',
      description: '授权并绑定你的Twitter账号',
      completed: false,
      points: 20
    },
    {
      id: 3,
      title: '关注Twitter账号',
      description: '关注我们的官方Twitter账号',
      completed: false,
      points: 30
    },
    {
      id: 4,
      title: '转发推文',
      description: '转发指定的推文',
      completed: false,
      points: 40
    }
  ]);

  useEffect(() => {
    // 检查钱包连接状态
    if (wallet.connected) {
      setTasks(prev => 
        prev.map(task => 
          task.id === 1 ? { ...task, completed: true } : task
        )
      );
    }

    // 检查Twitter授权状态
    if (session?.user) {
      setTasks(prev => 
        prev.map(task => 
          task.id === 2 ? { ...task, completed: true } : task
        )
      );
    }
  }, [wallet.connected, session]);

  const totalPoints = tasks.reduce((sum, task) => 
    task.completed ? sum + task.points : sum, 0
  );

  const maxPoints = tasks.reduce((sum, task) => sum + task.points, 0);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8">空投任务</h1>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-semibold">总进度</span>
          <span className="text-lg font-semibold">{totalPoints}/{maxPoints} 点数</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${(totalPoints / maxPoints) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-4">
        {tasks.map(task => (
          <div 
            key={task.id}
            className={`p-4 border rounded-lg ${task.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-sm text-gray-600">{task.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{task.points}点</span>
                {task.completed ? (
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        <WalletMultiButton className="w-full" />
      </div>
    </div>
  );
};

export default AirdropTasks;