import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Home,
  Briefcase,
  Users,
  Tag,
  Plus,
  LogOut,
  Trash2,
  CheckSquare,
} from 'lucide-react'
import { sectionsApi } from '../../api/sections'
import { useAuth } from '../../context/AuthContext'
import { cn, getInitials } from '../../lib/utils'
import SectionForm from './SectionForm'
import type { Section } from '../../types'

interface SectionSidebarProps {
  selectedSectionId: number | null
  onSectionSelect: (id: number | null) => void
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
  Family: <Users className="h-4 w-4" />,
  Office: <Briefcase className="h-4 w-4" />,
  Personal: <Home className="h-4 w-4" />,
}

export default function SectionSidebar({
  selectedSectionId,
  onSectionSelect,
}: SectionSidebarProps) {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  const [showSectionForm, setShowSectionForm] = useState(false)

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ['sections'],
    queryFn: sectionsApi.getSections,
  })

  const deleteSection = useMutation({
    mutationFn: sectionsApi.deleteSection,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['sections'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      if (selectedSectionId === deletedId) {
        onSectionSelect(null)
      }
    },
  })

  const handleDeleteSection = (e: React.MouseEvent, section: Section) => {
    e.stopPropagation()
    if (confirm(`Delete section "${section.name}"? Tasks inside will lose their section.`)) {
      deleteSection.mutate(section.id)
    }
  }

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-600 flex-shrink-0">
          <CheckSquare className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-semibold">TodoApp</span>
      </div>

      {/* User info */}
      {user && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white text-xs font-bold flex-shrink-0">
            {getInitials(user.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
      )}

      {/* All Tasks */}
      <div className="px-2 pt-3">
        <button
          onClick={() => onSectionSelect(null)}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-colors',
            selectedSectionId === null
              ? 'bg-primary-600 text-white'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          )}
        >
          <Home className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1 text-left font-medium">All Tasks</span>
        </button>
      </div>

      {/* Sections */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Sections
        </p>

        {isLoading ? (
          <div className="px-3 py-2 text-sm text-gray-400">Loading...</div>
        ) : (
          sections.map((section) => (
            <div key={section.id} className="group flex items-center">
              <button
                onClick={() => onSectionSelect(section.id)}
                className={cn(
                  'flex items-center gap-3 flex-1 px-3 py-2 rounded-md text-sm transition-colors min-w-0',
                  selectedSectionId === section.id
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <span className="flex-shrink-0">
                  {SECTION_ICONS[section.name] || <Tag className="h-4 w-4" />}
                </span>
                <span className="flex-1 text-left truncate">{section.name}</span>
                {section.taskCount > 0 && (
                  <span
                    className={cn(
                      'text-xs px-1.5 py-0.5 rounded-full font-medium',
                      selectedSectionId === section.id
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-700 text-gray-300'
                    )}
                  >
                    {section.taskCount}
                  </span>
                )}
              </button>

              {!section.isDefault && (
                <button
                  onClick={(e) => handleDeleteSection(e, section)}
                  className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1.5 rounded text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-all"
                  title="Delete section"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))
        )}

        {/* New Section form or button */}
        {showSectionForm ? (
          <div className="mt-1">
            <SectionForm onClose={() => setShowSectionForm(false)} />
          </div>
        ) : (
          <button
            onClick={() => setShowSectionForm(true)}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-md transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New section</span>
          </button>
        )}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
