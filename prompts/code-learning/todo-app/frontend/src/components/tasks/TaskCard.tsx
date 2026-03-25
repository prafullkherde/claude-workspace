import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Plus,
  Check,
  Tag,
} from 'lucide-react'
import { tasksApi } from '../../api/tasks'
import { subtasksApi } from '../../api/subtasks'
import { cn, formatDate, isOverdue, priorityColors, priorityLabels } from '../../lib/utils'
import SubtaskItem from './SubtaskItem'
import type { Task } from '../../types'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
}

export default function TaskCard({ task, onEdit }: TaskCardProps) {
  const queryClient = useQueryClient()
  const [isExpanded, setIsExpanded] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [showSubtaskInput, setShowSubtaskInput] = useState(false)

  const toggleComplete = useMutation({
    mutationFn: () => tasksApi.toggleTask(task.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['sections'] })
    },
  })

  const deleteTask = useMutation({
    mutationFn: () => tasksApi.deleteTask(task.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['sections'] })
    },
  })

  const addSubtask = useMutation({
    mutationFn: (title: string) => subtasksApi.addSubtask(task.id, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setNewSubtaskTitle('')
      setShowSubtaskInput(false)
    },
  })

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      addSubtask.mutate(newSubtaskTitle.trim())
    }
  }

  const handleDelete = () => {
    if (confirm(`Delete task "${task.title}"?`)) {
      deleteTask.mutate()
    }
  }

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length
  const totalSubtasks = task.subtasks.length

  const dueDateString = task.dueDate
  const overdue = !task.completed && isOverdue(dueDateString || undefined)

  return (
    <div
      className={cn(
        'card p-4 transition-shadow hover:shadow-card-hover',
        task.completed && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Completion checkbox */}
        <button
          onClick={() => toggleComplete.mutate()}
          disabled={toggleComplete.isPending}
          className={cn(
            'mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 transition-colors flex items-center justify-center',
            task.completed
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300 hover:border-primary-500'
          )}
        >
          {task.completed && <Check className="h-3 w-3 text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          {/* Title + actions row */}
          <div className="flex items-start gap-2">
            <h3
              className={cn(
                'flex-1 text-sm font-medium text-gray-900 leading-snug',
                task.completed && 'line-through text-gray-400'
              )}
            >
              {task.title}
            </h3>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => onEdit(task)}
                className="p-1 rounded text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                title="Edit task"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteTask.isPending}
                className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                title="Delete task"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className="mt-1 text-xs text-gray-500 line-clamp-2">{task.description}</p>
          )}

          {/* Meta row: priority, due date, section */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                priorityColors[task.priority]
              )}
            >
              {priorityLabels[task.priority]}
            </span>

            {dueDateString && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-xs',
                  overdue ? 'text-red-600 font-medium' : 'text-gray-500'
                )}
              >
                <Calendar className="h-3 w-3" />
                {overdue ? 'Overdue: ' : ''}{formatDate(dueDateString)}
              </span>
            )}

            {task.sectionName && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                <Tag className="h-3 w-3" />
                {task.sectionName}
              </span>
            )}
          </div>

          {/* Subtasks toggle */}
          {(totalSubtasks > 0 || !task.completed) && (
            <div className="mt-3">
              <div className="flex items-center gap-2">
                {totalSubtasks > 0 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                    <span>
                      Subtasks ({completedSubtasks}/{totalSubtasks})
                    </span>
                  </button>
                )}

                {!task.completed && (
                  <button
                    onClick={() => {
                      setShowSubtaskInput(true)
                      setIsExpanded(true)
                    }}
                    className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add subtask
                  </button>
                )}
              </div>

              {isExpanded && (
                <div className="mt-2 pl-1 border-l-2 border-gray-100 space-y-0.5">
                  {task.subtasks.map((subtask) => (
                    <SubtaskItem key={subtask.id} subtask={subtask} taskId={task.id} />
                  ))}

                  {showSubtaskInput && (
                    <div className="flex items-center gap-2 pt-1">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-200 flex-shrink-0" />
                      <input
                        type="text"
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddSubtask()
                          if (e.key === 'Escape') {
                            setShowSubtaskInput(false)
                            setNewSubtaskTitle('')
                          }
                        }}
                        placeholder="Subtask title..."
                        className="flex-1 text-sm border-b border-gray-300 focus:border-primary-500 focus:outline-none py-0.5 bg-transparent"
                        autoFocus
                      />
                      <button
                        onClick={handleAddSubtask}
                        disabled={!newSubtaskTitle.trim() || addSubtask.isPending}
                        className="p-1 rounded bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
