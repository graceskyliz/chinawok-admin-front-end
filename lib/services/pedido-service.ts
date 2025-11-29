import { getApiUrl } from '@/lib/config/api-config'

export interface EmpleadoEnPedido {
  nombre_completo?: string
  calificacion_prom?: string
  dni?: string
  rol?: string
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
  cantidad: string | number
}

export interface ProductoEnPedido {
  nombre: string
  cantidad: string | number
}

export interface Pedido {
  pedido_id: string
  local_id: string
  combos?: ComboEnPedido[]
  productos?: ProductoEnPedido[]
  historial_estados: HistorialEstado[]
  estado: string
  costo: string | number
  fecha_entrega_aproximada: string
  direccion: string
  usuario_correo: string
  esperando_confirmacion?: boolean
  task_token?: string
}

export interface PedidosResponse {
  data: Pedido[]
}

export interface PedidoResponse {
  message: string
  data: Pedido
}

export interface DeletePedidoResponse {
  message: string
  data: {
    local_id: string
    pedido_id: string
  }
}

export interface PedidoProductoPayload {
  nombre: string
  cantidad: number
}

export interface PedidoComboPayload {
  combo_id: string
  cantidad: number
}

export interface CreatePedidoRequest {
  local_id: string
  usuario_correo: string
  productos?: PedidoProductoPayload[]
  combos?: PedidoComboPayload[]
  costo: number
  direccion: string
  fecha_entrega_aproximada: string
}

export interface HistorialEstadoPayload {
  estado: string
  hora_inicio: string
  hora_fin: string
  activo: boolean
  empleado?: Pick<EmpleadoEnPedido, 'dni'>
}

export interface UpdatePedidoRequest {
  local_id: string
  pedido_id: string
  estado?: string
  productos?: PedidoProductoPayload[]
  combos?: PedidoComboPayload[]
  historial_estados?: HistorialEstadoPayload[]
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

  async getPedidoById(localId: string, pedidoId: string): Promise<PedidoResponse> {
    try {
      const data = await this.fetchWithAuth(
        `${this.baseUrl}/pedidos?local_id=${localId}&pedido_id=${pedidoId}`
      )
      return data
    } catch (error) {
      console.error('Error fetching pedido:', error)
      throw error
    }
  }

  async createPedido(payload: CreatePedidoRequest): Promise<PedidoResponse> {
    try {
      const data = await this.fetchWithAuth(`${this.baseUrl}/pedidos`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      return data
    } catch (error) {
      console.error('Error creating pedido:', error)
      throw error
    }
  }

  async updatePedido(payload: UpdatePedidoRequest): Promise<PedidoResponse> {
    try {
      const data = await this.fetchWithAuth(`${this.baseUrl}/pedidos`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
      return data
    } catch (error) {
      console.error('Error updating pedido:', error)
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
