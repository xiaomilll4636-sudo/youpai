import request from './request'

export interface Address {
  id: string
  userId: string
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
  createdAt: Date
}

export interface CreateAddressParams {
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault?: boolean
}

export const addressApi = {
  getList: () =>
    request.get<Address[]>('/addresses'),

  getDetail: (id: string) =>
    request.get<Address>(`/addresses/${id}`),

  create: (data: CreateAddressParams) =>
    request.post<Address>('/addresses', data),

  update: (id: string, data: Partial<CreateAddressParams>) =>
    request.put<Address>(`/addresses/${id}`, data),

  delete: (id: string) =>
    request.delete(`/addresses/${id}`),

  setDefault: (id: string) =>
    request.put(`/addresses/${id}/default`),
}
