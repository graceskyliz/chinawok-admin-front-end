import { getApiUrl } from '@/lib/config/api-config'

export interface Oferta {
  local_id: string
  combo_id?: string
  producto_nombre?: string
  porcentaje_descuento: string | number
  fecha_limite: string
  fecha_inicio: string
  oferta_id: string
}

export interface CreateOfertaRequest {
  local_id: string
  porcentaje_descuento: number
  fecha_inicio: string
  fecha_limite: string
  producto_nombre?: string
  combo_id?: string
}

export interface OfertasResponse {
  data: Oferta[]
  count?: number
}

export interface CreateOfertaResponse {
  message: string
  data: Oferta
}

export interface DeleteOfertaResponse {
  message: string
  data: {
    local_id: string
    oferta_id: string
  }
}

export interface UpdateOfertaRequest {
  local_id: string
  oferta_id: string
  producto_nombre?: string
  porcentaje_descuento: number
  fecha_limite: string
}

export interface UpdateOfertaResponse {
  message: string
  data: {
    local_id: string
    oferta_id: string
    combo_id?: string
    producto_nombre?: string
    porcentaje_descuento: string
    fecha_limite: string
    fecha_inicio: string
  }
}

class OfertaService {
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

  async getOfertasByLocal(localId: string): Promise<OfertasResponse> {
    try {
      const data = await this.fetchWithAuth(`${this.baseUrl}/ofertas?local_id=${localId}`)
      return data
    } catch (error) {
      console.error('Error fetching ofertas:', error)
      throw error
    }
  }

  async createOferta(request: CreateOfertaRequest): Promise<CreateOfertaResponse> {
    try {
      const data = await this.fetchWithAuth(`${this.baseUrl}/ofertas`, {
        method: 'POST',
        body: JSON.stringify(request),
      })
      return data
    } catch (error) {
      console.error('Error creating oferta:', error)
      throw error
    }
  }

  async deleteOferta(localId: string, ofertaId: string): Promise<DeleteOfertaResponse> {
    try {
      const data = await this.fetchWithAuth(
        `${this.baseUrl}/ofertas?local_id=${localId}&oferta_id=${ofertaId}`,
        {
          method: 'DELETE',
        }
      )
      return data
    } catch (error) {
      console.error('Error deleting oferta:', error)
      throw error
    }
  }

  async updateOferta(request: UpdateOfertaRequest): Promise<UpdateOfertaResponse> {
    try {
      const data = await this.fetchWithAuth(`${this.baseUrl}/ofertas`, {
        method: 'PUT',
        body: JSON.stringify(request),
      })
      return data
    } catch (error) {
      console.error('Error updating oferta:', error)
      throw error
    }
  }
}

export const ofertaService = new OfertaService()
