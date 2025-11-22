import { getApiUrl } from '@/lib/config/api-config'

export interface Gerente {
  nombre: string
  correo: string
  contrasena?: string
}

export interface Local {
  local_id: string
  telefono: string
  hora_finalizacion: string
  direccion: string
  hora_apertura: string
  gerente: Gerente
}

export interface LocalesResponse {
  locales: Local[]
  message?: string
}

class LocalService {
  private get baseUrl(): string {
    return getApiUrl('locales')
  }

  private async fetchWithAuth(url: string, options?: RequestInit) {
    const token = localStorage.getItem('auth_token')
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`
      throw new Error(errorMessage)
    }

    return response.json()
  }

  async listarLocales(): Promise<Local[]> {
    try {
      const data = await this.fetchWithAuth(`${this.baseUrl}/local/listar`)
      return data.locales || data
    } catch (error) {
      console.error('Error listing locales:', error)
      throw error
    }
  }

  async findLocalByGerenteEmail(correo: string): Promise<Local | null> {
    try {
      const locales = await this.listarLocales()
      const local = locales.find(l => l.gerente.correo === correo)
      return local || null
    } catch (error) {
      console.error('Error finding local by gerente email:', error)
      throw error
    }
  }

  async getEmpleadosByLocal(localId: string) {
    try {
      const empleadosUrl = getApiUrl('empleados')
      const data = await this.fetchWithAuth(`${empleadosUrl}/empleados/local/${localId}`)
      return data
    } catch (error) {
      console.error('Error getting empleados by local:', error)
      throw error
    }
  }
}

export const localService = new LocalService()
