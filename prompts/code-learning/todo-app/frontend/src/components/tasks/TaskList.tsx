import { useQuery } from '@tanstack/react-query'
import { ClipboardList } from 'lucide-react'
import { tasksApi } from '../../api/tasks'
import TaskCard from './TaskCard'
import type { Task } from '../../types'

interface TaskListProps {
  sectionId: number | null
  onEditTask: (task: Task) => void
}

export default function TaskList({ sectionId, onEditTask }: TaskListProps) {
  const { data: tasks = [], isLoading, isError, error } = useQuery({
    queryKey: ['tasks', sectionId],
    queryFn: () => tasksApi.getTasks(sectionId ?? undefined),
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="card p-4 animate-pulse"
          >
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-gray-200 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-gray-100 rounded-full" />
                  <div className="h-5 w-24 bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    const errMessage =
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      'Failed to load tasks'
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
          <ClipboardList className="h-6 w-6 text-red-500" />
        </div>
        <h3 className="text-base font-medium text-gray-900 mb-1">Error loading tasks</h3>
        <p className="text-sm text-gray-500">{errMessage}</p>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-4">
          <ClipboardList className="h-8 w-8 text-primary-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks yet</h3>
        <p className="text-sm text-gray-500">
          Click the "+ Add Task" button to create your first task
        </p>
      </div>
    )
  }

  const activeTasks = tasks.filter((t) => !t.completed)
  const completedTasks = tasks.filter((t) => t.completed)

  return (
    <div className="space-y-6">
      {/* Active tasks */}
      {activeTasks.length > 0 && (
        <div className="space-y-3">
          {activeTasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEditTask} />
          ))}
        </div>
      )}

      {/* Completed tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
            Completed ({completedTasks.length})
          </h3>
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={onEditTask} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
