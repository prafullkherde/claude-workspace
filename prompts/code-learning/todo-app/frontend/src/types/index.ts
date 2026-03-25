export enum Priority {
  URGENT = 'URGENT',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export interface User {
  name: string
  email: string
}

export interface AuthResponse {
  token: string
  name: string
  email: string
}

export interface Section {
  id: number
  name: string
  isDefault: boolean
  taskCount: number
}

export interface Subtask {
  id: number
  title: string
  completed: boolean
}

export interface Task {
  id: number
  title: string
  description: string | null
  priority: Priority
  dueDate: string | null
  completed: boolean
  createdAt: string
  sectionId: number | null
  sectionName: string | null
  subtasks: Subtask[]
}

export interface TaskRequest {
  title: string
  description?: string
  priority: Priority
  dueDate?: string
  sectionId?: number
}

export interface SectionRequest {
  name: string
}

export interface SubtaskRequest {
  title: string
}

export interface ApiError {
  status: number
  message: string
  timestamp: string
}
