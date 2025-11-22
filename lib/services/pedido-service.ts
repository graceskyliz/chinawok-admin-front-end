import { getApiUrl } from '@/lib/config/api-config'

export interface EmpleadoEnPedido {
  nombre_completo: string
  calificacion_prom: string
  dni: string
  rol: string
}

export interface HistorialEstado {
  hora_fin: string
  estado: string
  empleado: EmpleadoEnPedido | null
  hora_inicio: string
  activo: boolean
}

export interface ComboEnPedido {
  combo_id: string
  cantidad: string
}

export interface ProductoEnPedido {
  nombre: string
  cantidad: string
}

export interface Pedido {
  pedido_id: string
  local_id: string
  combos?: ComboEnPedido[]
  productos?: ProductoEnPedido[]
  historial_estados: HistorialEstado[]
  estado: string
  costo: string
  fecha_entrega_aproximada: string
  direccion: string
  usuario_correo: string
}

export interface PedidosResponse {
  data: Pedido[]
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

  async getPedidosByLocal(localId: string): Promise<PedidosResponse> {
    try {
      const data = await this.fetchWithAuth(`${this.baseUrl}/pedidos?local_id=${localId}`)
      return data
    } catch (error) {
      console.error('Error fetching pedidos:', error)
      throw error
    }
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
