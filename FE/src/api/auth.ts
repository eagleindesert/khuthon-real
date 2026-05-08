import { apiClient } from './client'
import type { User } from '@/types'

export interface LoginRequest {
  loginId: string
  password: string
}

export interface RegisterRequest {
  loginId: string
  password: string
  nickname: string
  preferredGenre: string
}

export const login = (data: LoginRequest) =>
  apiClient.post<User>('/auth/login', data)

export const signUp = (data: RegisterRequest) =>
  apiClient.post<User>('/auth/register', data)

export const getMe = () =>
  apiClient.get<User>('/auth/me')

export const logout = () =>
  apiClient.post('/auth/logout')
