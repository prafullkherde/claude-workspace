import apiClient from './axios'
import type { Subtask, SubtaskRequest } from '../types'

export const subtasksApi = {
  getSubtasks: async (taskId: number): Promise<Subtask[]> => {
    const response = await apiClient.get<Subtask[]>(`/tasks/${taskId}/subtasks`)
    return response.data
  },

  addSubtask: async (taskId: number, data: SubtaskRequest): Promise<Subtask> => {
    const response = await apiClient.post<Subtask>(`/tasks/${taskId}/subtasks`, data)
    return response.data
  },

  updateSubtask: async (taskId: number, id: number, data: SubtaskRequest): Promise<Subtask> => {
    const response = await apiClient.put<Subtask>(`/tasks/${taskId}/subtasks/${id}`, data)
    return response.data
  },

  deleteSubtask: async (taskId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tasks/${taskId}/subtasks/${id}`)
  },

  toggleSubtask: async (taskId: number, id: number): Promise<Subtask> => {
    const response = await apiClient.patch<Subtask>(`/tasks/${taskId}/subtasks/${id}/toggle`)
    return response.data
  },
}
