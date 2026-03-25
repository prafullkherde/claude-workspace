import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Check } from 'lucide-react'
import { subtasksApi } from '../../api/subtasks'
import { cn } from '../../lib/utils'
import type { Subtask } from '../../types'

interface SubtaskItemProps {
  subtask: Subtask
  taskId: number
}

export default function SubtaskItem({ subtask, taskId }: SubtaskItemProps) {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(subtask.title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  const toggleSubtask = useMutation({
    mutationFn: () => subtasksApi.toggleSubtask(taskId, subtask.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const updateSubtask = useMutation({
    mutationFn: (title: string) =>
      subtasksApi.updateSubtask(taskId, subtask.id, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setIsEditing(false)
    },
  })

  const deleteSubtask = useMutation({
    mutationFn: () => subtasksApi.deleteSubtask(taskId, subtask.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const handleBlur = () => {
    if (editValue.trim() && editValue.trim() !== subtask.title) {
      updateSubtask.mutate(editValue.trim())
    } else {
      setEditValue(subtask.title)
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur()
    } else if (e.key === 'Escape') {
      setEditValue(subtask.title)
      setIsEditing(false)
    }
  }

  return (
    <div className="flex items-center gap-2 group py-1">
      <button
        onClick={() => toggleSubtask.mutate()}
        disabled={toggleSubtask.isPending}
        className={cn(
          'flex-shrink-0 w-4 h-4 rounded border-2 transition-colors flex items-center justify-center',
          subtask.completed
            ? 'bg-green-500 border-green-500'
            : 'border-gray-300 hover:border-primary-400'
        )}
      >
        {subtask.completed && <Check className="h-2.5 w-2.5 text-white" />}
      </button>

      {isEditing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="flex-1 text-sm bg-transparent border-b border-primary-400 outline-none py-0.5"
        />
      ) : (
        <span
          className={cn(
            'flex-1 text-sm cursor-pointer',
            subtask.completed && 'line-through text-gray-400'
          )}
          onClick={() => setIsEditing(true)}
        >
          {subtask.title}
        </span>
      )}

      <button
        onClick={() => deleteSubtask.mutate()}
        disabled={deleteSubtask.isPending}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all disabled:opacity-50"
        title="Delete subtask"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
