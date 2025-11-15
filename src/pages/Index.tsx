import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

interface GameStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalCompleted: number;
  badges: string[];
}

const BADGES = {
  first_task: { emoji: '🌟', name: 'Первый шаг', description: 'Выполнил первую задачу' },
  tasks_10: { emoji: '🎯', name: 'Новичок', description: 'Выполнил 10 задач' },
  tasks_25: { emoji: '🏆', name: 'Профи', description: 'Выполнил 25 задач' },
  level_5: { emoji: '⚡', name: 'Энергичный', description: 'Достиг 5 уровня' },
  level_10: { emoji: '👑', name: 'Мастер', description: 'Достиг 10 уровня' },
};

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [stats, setStats] = useState<GameStats>({
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    totalCompleted: 0,
    badges: [],
  });
  const { toast } = useToast();

  useEffect(() => {
    const savedTasks = localStorage.getItem('todoTasks');
    const savedStats = localStorage.getItem('todoStats');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedStats) setStats(JSON.parse(savedStats));
  }, []);

  useEffect(() => {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
    localStorage.setItem('todoStats', JSON.stringify(stats));
  }, [tasks, stats]);

  const addXP = (amount: number) => {
    setStats((prev) => {
      let newXP = prev.xp + amount;
      let newLevel = prev.level;
      let newXPToNext = prev.xpToNextLevel;
      const newBadges = [...prev.badges];

      while (newXP >= newXPToNext) {
        newXP -= newXPToNext;
        newLevel += 1;
        newXPToNext = Math.floor(newXPToNext * 1.5);

        toast({
          title: `🎊 Новый уровень: ${newLevel}!`,
          description: `Ты достиг ${newLevel} уровня!`,
          duration: 4000,
        });

        if (newLevel === 5 && !newBadges.includes('level_5')) {
          newBadges.push('level_5');
          showBadgeNotification('level_5');
        }
        if (newLevel === 10 && !newBadges.includes('level_10')) {
          newBadges.push('level_10');
          showBadgeNotification('level_10');
        }
      }

      return {
        ...prev,
        level: newLevel,
        xp: newXP,
        xpToNextLevel: newXPToNext,
        badges: newBadges,
      };
    });
  };

  const showBadgeNotification = (badgeKey: string) => {
    const badge = BADGES[badgeKey as keyof typeof BADGES];
    toast({
      title: `${badge.emoji} Новый бейдж!`,
      description: `${badge.name}: ${badge.description}`,
      duration: 5000,
    });
  };

  const addTask = () => {
    if (!newTask.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      text: newTask,
      completed: false,
      createdAt: Date.now(),
    };

    setTasks([task, ...tasks]);
    setNewTask('');
    toast({
      title: '✅ Задача добавлена',
      description: 'Выполни её и получи опыт!',
    });
  };

  const toggleTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));

    if (!task.completed) {
      const xpGain = 20;
      addXP(xpGain);

      const newTotal = stats.totalCompleted + 1;
      setStats((prev) => {
        const newBadges = [...prev.badges];
        
        if (newTotal === 1 && !newBadges.includes('first_task')) {
          newBadges.push('first_task');
          showBadgeNotification('first_task');
        }
        if (newTotal === 10 && !newBadges.includes('tasks_10')) {
          newBadges.push('tasks_10');
          showBadgeNotification('tasks_10');
        }
        if (newTotal === 25 && !newBadges.includes('tasks_25')) {
          newBadges.push('tasks_25');
          showBadgeNotification('tasks_25');
        }

        return { ...prev, totalCompleted: newTotal, badges: newBadges };
      });

      toast({
        title: `+${xpGain} XP`,
        description: '🎮 Отличная работа!',
        duration: 2000,
      });
    }
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const progressPercent = (stats.xp / stats.xpToNextLevel) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="p-6 animate-fade-in bg-white/80 backdrop-blur border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-purple-900">
                🎮 Game ToDo
              </h1>
              <p className="text-purple-600 mt-1">Выполняй задачи и прокачивайся!</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-heading font-bold text-purple-700">
                LVL {stats.level}
              </div>
              <div className="text-sm text-purple-500">{stats.totalCompleted} задач</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-600 font-medium">Прогресс до {stats.level + 1} уровня</span>
              <span className="text-purple-700 font-bold">
                {stats.xp} / {stats.xpToNextLevel} XP
              </span>
            </div>
            <Progress value={progressPercent} className="h-3 animate-pulse-glow" />
          </div>
        </Card>

        {stats.badges.length > 0 && (
          <Card className="p-4 animate-scale-in bg-gradient-to-r from-purple-500 to-pink-500 border-0">
            <h3 className="text-white font-heading font-bold mb-3 flex items-center gap-2">
              <Icon name="Award" className="text-yellow-300" size={20} />
              Бейджи
            </h3>
            <div className="flex flex-wrap gap-2">
              {stats.badges.map((badgeKey) => {
                const badge = BADGES[badgeKey as keyof typeof BADGES];
                return (
                  <Badge
                    key={badgeKey}
                    className="bg-white/20 backdrop-blur text-white border-white/30 text-sm px-3 py-1.5 animate-bounce-in hover:scale-110 transition-transform cursor-pointer"
                  >
                    <span className="mr-1.5">{badge.emoji}</span>
                    {badge.name}
                  </Badge>
                );
              })}
            </div>
          </Card>
        )}

        <Card className="p-6 animate-fade-in bg-white/80 backdrop-blur border-2 border-purple-200">
          <div className="flex gap-2">
            <Input
              placeholder="Новая задача..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              className="flex-1 border-purple-300 focus:border-purple-500"
            />
            <Button
              onClick={addTask}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium"
            >
              <Icon name="Plus" size={20} />
            </Button>
          </div>
        </Card>

        <div className="space-y-3">
          {tasks.length === 0 ? (
            <Card className="p-8 text-center animate-fade-in bg-white/60 backdrop-blur border-2 border-dashed border-purple-300">
              <div className="text-6xl mb-3">📝</div>
              <p className="text-purple-600 font-medium">Добавь свою первую задачу!</p>
              <p className="text-purple-400 text-sm mt-1">Начни прокачку прямо сейчас</p>
            </Card>
          ) : (
            tasks.map((task, index) => (
              <Card
                key={task.id}
                className={`p-4 animate-fade-in bg-white/80 backdrop-blur border-2 transition-all hover:shadow-lg ${
                  task.completed
                    ? 'border-green-300 bg-green-50/50'
                    : 'border-purple-200 hover:border-purple-400'
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      task.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-purple-400 hover:border-purple-600'
                    }`}
                  >
                    {task.completed && <Icon name="Check" size={16} className="text-white" />}
                  </button>
                  <span
                    className={`flex-1 ${
                      task.completed
                        ? 'line-through text-gray-500'
                        : 'text-purple-900 font-medium'
                    }`}
                  >
                    {task.text}
                  </span>
                  {task.completed && (
                    <span className="text-green-600 font-bold text-sm">+20 XP</span>
                  )}
                  <Button
                    onClick={() => deleteTask(task.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Icon name="Trash2" size={18} />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
