export type UserRole = 'admin' | 'gerente'

export interface User {
  id?: string
  name: string
  email: string
  role: UserRole
  local_id?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}
