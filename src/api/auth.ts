import request from './request'
import type { User } from '../store/auth'

export interface LoginParams {
  phone: string
  password: string
}

export interface RegisterParams {
  phone: string
  password: string
  code: string
  nickname?: string
}

export interface SendCodeParams {
  phone: string
  type: 'register' | 'login' | 'reset'
}

export const authApi = {
  login: (params: LoginParams) =>
    request.post<{ token: string; user: User }>('/auth/login', params),

  register: (params: RegisterParams) =>
    request.post<{ token: string; user: User }>('/auth/register', params),

  sendCode: (params: SendCodeParams) =>
    request.post('/auth/send-code', params),

  logout: () =>
    request.post('/auth/logout'),

  getProfile: () =>
    request.get<User>('/auth/profile'),

  updateProfile: (data: Partial<User>) =>
    request.put<User>('/auth/profile', data),

  changePassword: (oldPassword: string, newPassword: string) =>
    request.put('/auth/password', { oldPassword, newPassword }),

  resetPassword: (phone: string, code: string, newPassword: string) =>
    request.post('/auth/reset-password', { phone, code, newPassword }),
}
