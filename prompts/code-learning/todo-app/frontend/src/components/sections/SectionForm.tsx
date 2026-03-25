import { useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, X } from 'lucide-react'
import { sectionsApi } from '../../api/sections'
import { cn } from '../../lib/utils'

const sectionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Max 100 characters'),
})

type SectionFormData = z.infer<typeof sectionSchema>

interface SectionFormProps {
  onClose: () => void
}

export default function SectionForm({ onClose }: SectionFormProps) {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SectionFormData>({
    resolver: zodResolver(sectionSchema),
  })

  const { ref: formRef, ...restRegister } = register('name')

  const createSection = useMutation({
    mutationFn: sectionsApi.createSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] })
      onClose()
    },
  })

  const onSubmit = async (data: SectionFormData) => {
    await createSection.mutateAsync(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-3 pb-2">
      <div className="flex items-center gap-1">
        <input
          ref={(e) => {
            formRef(e)
            // @ts-expect-error - ref assignment
            inputRef.current = e
          }}
          {...restRegister}
          type="text"
          placeholder="Section name..."
          className={cn(
            'flex-1 h-8 rounded border border-gray-300 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500',
            errors.name && 'border-red-400'
          )}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose()
          }}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center h-8 w-8 rounded bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center h-8 w-8 rounded border border-gray-200 text-gray-500 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {errors.name && (
        <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
      )}
    </form>
  )
}
