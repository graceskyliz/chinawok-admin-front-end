import { getApiUrl } from '@/lib/config/api-config'

export interface LoginRequest {
  correo: string
  contrasena: string
}

export interface RegisterRequest {
  nombre: string
  correo: string
  contrasena: string
}

export interface LoginResponse {
  token?: string
  usuario?: {
    id?: string
    nombre: string
    correo: string
    role?: string
  }
  message?: string
}

export interface RegisterResponse {
  token?: string
  usuario?: {
    correo: string
    nombre: string
    role?: string
  }
  message?: string
}

export interface UserInfoResponse {
  message?: string
  usuario: {
    nombre: string
    correo: string
    apellido?: string
    historial_pedidos?: any[]
    role: string
  }
}

class AuthService {
  private get baseUrl(): string {
    return getApiUrl('usuarios')
  }

  async login(correo: string, contrasena: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/usuario/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, contrasena }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      // Store token if provided
      if (data.token) {
        localStorage.setItem('auth_token', data.token)
      }

      return data
    } catch (error) {
      console.error('Login error:', error)
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Please check if CORS is enabled on the API.')
      }
      throw error
    }
  }

  async register(nombre: string, correo: string, contrasena: string): Promise<RegisterResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/usuario/registrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, correo, contrasena }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      // Store token if provided
      if (data.token) {
        localStorage.setItem('auth_token', data.token)
      }
      
      return data
    } catch (error) {
      console.error('Register error:', error)
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Please check if CORS is enabled on the API.')
      }
      throw error
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }

  removeToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('auth_token')
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/usuario/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      return response.ok
    } catch (error) {
      console.error('Token validation error:', error)
      return false
    }
  }

  async getUserInfo(): Promise<UserInfoResponse> {
    try {
      const token = this.getToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${this.baseUrl}/usuario/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`
        throw new Error(errorMessage)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get user info error:', error)
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Please check if CORS is enabled on the API.')
      }
      throw error
    }
  }
}

export const authService = new AuthService()
