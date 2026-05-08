import { apiClient } from './client'
import type { User } from '@/types'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: User
}

export interface SignUpRequest {
  username: string
  password: string
  nickname: string
  tags: string[]
}

export const login = (data: LoginRequest) =>
  apiClient.post<LoginResponse>('/auth/login', data)

export const signUp = (data: SignUpRequest) =>
  apiClient.post<{ user: User }>('/auth/signup', data)

export const getMe = () =>
  apiClient.get<User>('/auth/me')

export const logout = () =>
  apiClient.post('/auth/logout')
