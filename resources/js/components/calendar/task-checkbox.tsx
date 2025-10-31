import { Checkbox } from '@/components/ui/checkbox';
import { tasks } from '@/routes';
import { useForm } from '@inertiajs/react';

interface TaskCheckboxProps {
  task: {
    id: number;
    title: string;
    completed: boolean;
    xp_reward?: number;
  };
}

export function TaskCheckbox({ task }: TaskCheckboxProps) {
  const { data, setData, patch, processing } = useForm({
    completed: task.completed,
  });

  const handleChange = (checked: boolean | 'indeterminate') => {
    const newValue = checked === true;
    setData('completed', newValue);
    patch(tasks({ task: task.id }).url, {
      preserveScroll: true,
    });
  };

  return (
    <div className="flex items-center gap-3">
      <Checkbox
        checked={data.completed}
        disabled={processing}
        onCheckedChange={handleChange}
      />
      <div className="flex-1">
        <div
          className={data.completed ? 'text-muted-foreground line-through' : ''}
        >
          {task.title}
        </div>
        {task.xp_reward && (
          <div className="text-xs text-muted-foreground">
            {task.xp_reward} XP
          </div>
        )}
      </div>
    </div>
  );
}
