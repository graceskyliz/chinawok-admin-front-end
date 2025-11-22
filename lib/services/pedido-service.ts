import { getApiUrl } from '@/lib/config/api-config'

export interface Pedido {
  pedido_id: string
  local_id: string
  cliente_id?: string
  estado?: string
  total?: string
  fecha?: string
  items?: string
  direccion?: string
  telefono?: string
}

export interface DeletePedidoResponse {
  message: string
  data: {
    local_id: string
    pedido_id: string
  }
}

class PedidoService {
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

  async deletePedido(localId: string, pedidoId: string): Promise<DeletePedidoResponse> {
    try {
      const data = await this.fetchWithAuth(
        `${this.baseUrl}/pedidos?local_id=${localId}&pedido_id=${pedidoId}`,
        {
          method: 'DELETE',
        }
      )
      return data
    } catch (error) {
      console.error('Error deleting pedido:', error)
      throw error
    }
  }
}

export const pedidoService = new PedidoService()
