import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { tasksApi } from '../../api/tasks'
import { sectionsApi } from '../../api/sections'
import { Priority } from '../../types'
import { cn } from '../../lib/utils'
import type { Task } from '../../types'

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().optional(),
  priority: z.nativeEnum(Priority),
  dueDate: z.string().optional(),
  sectionId: z.string().optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskFormProps {
  task?: Task | null
  defaultSectionId?: number | null
  onClose: () => void
}

export default function TaskForm({ task, defaultSectionId, onClose }: TaskFormProps) {
  const queryClient = useQueryClient()

  const { data: sections = [] } = useQuery({
    queryKey: ['sections'],
    queryFn: sectionsApi.getSections,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      priority: task?.priority ?? Priority.MEDIUM,
      dueDate: task?.dueDate ?? '',
      sectionId: task?.sectionId?.toString() ?? defaultSectionId?.toString() ?? '',
    },
  })

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description ?? '',
        priority: task.priority,
        dueDate: task.dueDate ?? '',
        sectionId: task.sectionId?.toString() ?? '',
      })
    }
  }, [task, reset])

  const createTask = useMutation({
    mutationFn: tasksApi.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['sections'] })
      onClose()
    },
  })

  const updateTask = useMutation({
    mutationFn: (data: Parameters<typeof tasksApi.updateTask>[1]) =>
      tasksApi.updateTask(task!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['sections'] })
      onClose()
    },
  })

  const onSubmit = async (data: TaskFormData) => {
    const payload = {
      title: data.title,
      description: data.description || undefined,
      priority: data.priority,
      dueDate: data.dueDate || undefined,
      sectionId: data.sectionId ? parseInt(data.sectionId) : undefined,
    }

    if (task) {
      await updateTask.mutateAsync(payload)
    } else {
      await createTask.mutateAsync(payload)
    }
  }

  const mutationError = createTask.error || updateTask.error
  const errorMessage = mutationError
    ? (mutationError as { response?: { data?: { message?: string } } }).response?.data?.message ||
      'Something went wrong'
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {errorMessage && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="label block">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Task title..."
              className={cn('input', errors.title && 'border-red-500 focus-visible:ring-red-500')}
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="label block">Description</label>
            <textarea
              rows={3}
              placeholder="Add a description..."
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 resize-none"
              {...register('description')}
            />
          </div>

          {/* Priority + Due Date in grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="label block">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                className={cn(
                  'input',
                  errors.priority && 'border-red-500 focus-visible:ring-red-500'
                )}
                {...register('priority')}
              >
                <option value={Priority.URGENT}>Urgent</option>
                <option value={Priority.HIGH}>High</option>
                <option value={Priority.MEDIUM}>Medium</option>
                <option value={Priority.LOW}>Low</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="label block">Due Date</label>
              <input
                type="date"
                className="input"
                {...register('dueDate')}
              />
            </div>
          </div>

          {/* Section */}
          <div className="space-y-1">
            <label className="label block">Section</label>
            <select className="input" {...register('sectionId')}>
              <option value="">No section</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id.toString()}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1"
            >
              {isSubmitting
                ? task
                  ? 'Saving...'
                  : 'Creating...'
                : task
                ? 'Save changes'
                : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
