import { getApiUrl } from '@/lib/config/api-config'

export interface Resena {
  local_id: string
  calificacion: number
  pedido_id: string
  cocinero_dni: string
  resena: string
  repartidor_dni: string
  despachador_dni: string
  resena_id: string
}

export interface ResenasResponse {
  local_id: string
  total_resenas: number
  resenas: Resena[]
}

class ResenaService {
  private get baseUrl(): string {
    return getApiUrl('empleados')
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

  async getResenasByLocal(localId: string): Promise<ResenasResponse> {
    try {
      const data = await this.fetchWithAuth(`${this.baseUrl}/resenas/local/${localId}`)
      return data
    } catch (error) {
      console.error('Error fetching resenas:', error)
      throw error
    }
  }
}

export const resenaService = new ResenaService()
