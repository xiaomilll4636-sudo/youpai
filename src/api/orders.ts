import request from './request'
import type { Order } from '../types/housekeeping'

export interface CreateOrderParams {
  serviceTypeId: string
  housekeeperId?: string
  serviceAddress: string
  serviceDate: string
  serviceTime: string
  duration: number
  remark?: string
  contactName: string
  contactPhone: string
}

export interface OrderListParams {
  status?: string
  page?: number
  limit?: number
}

export const orderApi = {
  create: (data: CreateOrderParams) =>
    request.post<Order>('/orders', data),

  getList: (params?: OrderListParams) =>
    request.get<{ list: Order[]; total: number }>('/orders', { params }),

  getDetail: (id: string) =>
    request.get<Order>(`/orders/${id}`),

  cancel: (id: string, reason?: string) =>
    request.put(`/orders/${id}/cancel`, { reason }),

  pay: (id: string, payMethod: 'wechat' | 'alipay') =>
    request.post<{ payUrl: string }>(`/orders/${id}/pay`, { payMethod }),

  complete: (id: string) =>
    request.put(`/orders/${id}/complete`),

  review: (id: string, data: { rating: number; content?: string; images?: string[] }) =>
    request.post(`/orders/${id}/review`, data),
}
