import { getApiUrl } from '@/lib/config/api-config'

export interface Combo {
  local_id: string
  nombre: string
  descripcion?: string
  productos_nombres: string[]
  disponible?: boolean
  precio?: string
  combo_id: string
}

export interface CombosResponse {
  data: Combo[]
  count?: number
}

class ComboService {
  private get baseUrl(): string {
    return getApiUrl('pedidos')
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

  async getCombosByLocal(localId: string): Promise<CombosResponse> {
    try {
      const data = await this.fetchWithAuth(`${this.baseUrl}/combos?local_id=${localId}`)
      return data
    } catch (error) {
      console.error('Error fetching combos:', error)
      throw error
    }
  }

  async getComboById(localId: string, comboId: string): Promise<{ data: Combo }> {
    try {
      const data = await this.fetchWithAuth(
        `${this.baseUrl}/combos?local_id=${localId}&combo_id=${comboId}`
      )
      return data
    } catch (error) {
      console.error('Error fetching combo:', error)
      throw error
    }
  }
}

export const comboService = new ComboService()
