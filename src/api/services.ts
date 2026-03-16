import request from './request'
import type { ServiceType, Housekeeper } from '../types/housekeeping'

export const serviceApi = {
  getList: (): Promise<ServiceType[]> =>
    request.get('/services'),

  getDetail: (id: string): Promise<ServiceType> =>
    request.get(`/services/${id}`),
}

export const housekeeperApi = {
  getList: (params?: { serviceType?: string; page?: number; limit?: number }): Promise<{ list: Housekeeper[]; total: number }> =>
    request.get('/housekeepers', { params }),

  getDetail: (id: string): Promise<Housekeeper> =>
    request.get(`/housekeepers/${id}`),

  getReviews: (id: string, params?: { page?: number; limit?: number }) =>
    request.get(`/housekeepers/${id}/reviews`, { params }),

  getSchedule: (id: string, date: string) =>
    request.get(`/housekeepers/${id}/schedule`, { params: { date } }),
}
