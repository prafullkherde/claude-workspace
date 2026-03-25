import apiClient from './axios'
import type { Section, SectionRequest } from '../types'

export const sectionsApi = {
  getSections: async (): Promise<Section[]> => {
    const response = await apiClient.get<Section[]>('/sections')
    return response.data
  },

  createSection: async (data: SectionRequest): Promise<Section> => {
    const response = await apiClient.post<Section>('/sections', data)
    return response.data
  },

  deleteSection: async (id: number): Promise<void> => {
    await apiClient.delete(`/sections/${id}`)
  },
}
