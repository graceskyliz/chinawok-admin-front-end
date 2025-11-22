'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User, AuthState } from '@/lib/types/auth'
import { authService } from '@/lib/services/auth-service'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (name: string, email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user')
    const token = authService.getToken()
    
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('user')
        authService.removeToken()
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password)
      
      if (response.usuario) {
        // Determine role from email or API response
        let role: 'admin' | 'gerente' = 'gerente'
        if (email.includes('admin@')) {
          role = 'admin'
        } else if (email.includes('gerente')) {
          role = 'gerente'
        } else if (response.usuario.rol) {
          role = response.usuario.rol.toLowerCase() === 'admin' ? 'admin' : 'gerente'
        }

        const newUser: User = {
          id: response.usuario.id,
          name: response.usuario.nombre,
          email: response.usuario.correo,
          role
        }
        
        localStorage.setItem('user', JSON.stringify(newUser))
        setUser(newUser)
        setIsAuthenticated(true)
        router.push('/')
      } else {
        throw new Error('Respuesta inválida del servidor')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await authService.register(name, email, password)
      
      if (response.id || response.correo) {
        // After registration, log in automatically
        await login(email, password)
      } else {
        throw new Error('Error en el registro')
      }
    } catch (error) {
      console.error('Register error:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('user')
    authService.removeToken()
    setUser(null)
    setIsAuthenticated(false)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
