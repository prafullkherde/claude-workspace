import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import SectionSidebar from '../components/sections/SectionSidebar'
import TaskList from '../components/tasks/TaskList'
import TaskForm from '../components/tasks/TaskForm'
import { sectionsApi } from '../api/sections'
import type { Task } from '../types'

export default function DashboardPage() {
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const { data: sections = [] } = useQuery({
    queryKey: ['sections'],
    queryFn: sectionsApi.getSections,
  })

  const selectedSection = sections.find((s) => s.id === selectedSectionId)

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  const handleCloseForm = () => {
    setShowTaskForm(false)
    setEditingTask(null)
  }

  const handleOpenNewTask = () => {
    setEditingTask(null)
    setShowTaskForm(true)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <SectionSidebar
        selectedSectionId={selectedSectionId}
        onSectionSelect={setSelectedSectionId}
      />

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Page header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedSection ? selectedSection.name : 'All Tasks'}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {selectedSection
                  ? `${selectedSection.taskCount} pending task${selectedSection.taskCount !== 1 ? 's' : ''}`
                  : 'View and manage all your tasks'}
              </p>
            </div>

            <button
              onClick={handleOpenNewTask}
              className="btn-primary gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </button>
          </div>

          {/* Task list */}
          <TaskList sectionId={selectedSectionId} onEditTask={handleEditTask} />
        </div>
      </main>

      {/* Floating Add Task button (mobile) */}
      <button
        onClick={handleOpenNewTask}
        className="fixed bottom-6 right-6 md:hidden flex items-center justify-center w-14 h-14 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 transition-colors"
        aria-label="Add task"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          defaultSectionId={selectedSectionId}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}
