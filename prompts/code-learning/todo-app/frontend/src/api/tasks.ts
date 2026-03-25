import apiClient from './axios'
import type { Task, TaskRequest } from '../types'

export const tasksApi = {
  getTasks: async (sectionId?: number): Promise<Task[]> => {
    const params = sectionId ? { sectionId } : {}
    const response = await apiClient.get<Task[]>('/tasks', { params })
    return response.data
  },

  getTask: async (id: number): Promise<Task> => {
    const response = await apiClient.get<Task>(`/tasks/${id}`)
    return response.data
  },

  createTask: async (data: TaskRequest): Promise<Task> => {
    const response = await apiClient.post<Task>('/tasks', data)
    return response.data
  },

  updateTask: async (id: number, data: TaskRequest): Promise<Task> => {
    const response = await apiClient.put<Task>(`/tasks/${id}`, data)
    return response.data
  },

  deleteTask: async (id: number): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`)
  },

  toggleTask: async (id: number): Promise<Task> => {
    const response = await apiClient.patch<Task>(`/tasks/${id}/toggle`)
    return response.data
  },
}
