import { getApiUrl } from '@/lib/config/api-config'

export interface Producto {
  local_id: string
  stock: string
  descripcion: string
  categoria: string
  precio: string
  nombre: string
}

export interface ProductosResponse {
  data: Producto[]
  count: number
}

export interface DeleteProductoResponse {
  message: string
  data: {
    local_id: string
    nombre: string
  }
}

class ProductoService {
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

  async getProductosByLocal(localId: string): Promise<ProductosResponse> {
    try {
      const data = await this.fetchWithAuth(`${this.baseUrl}/productos?local_id=${localId}`)
      return data
    } catch (error) {
      console.error('Error fetching productos:', error)
      throw error
    }
  }

  async getProductoByNombre(localId: string, productoNombre: string): Promise<{ data: Producto }> {
    try {
      const data = await this.fetchWithAuth(
        `${this.baseUrl}/productos?local_id=${localId}&nombre=${encodeURIComponent(productoNombre)}`
      )
      return data
    } catch (error) {
      console.error('Error fetching producto:', error)
      throw error
    }
  }

  async deleteProducto(localId: string, productoNombre: string): Promise<DeleteProductoResponse> {
    try {
      const data = await this.fetchWithAuth(
        `${this.baseUrl}/productos?local_id=${localId}&nombre=${encodeURIComponent(productoNombre)}`,
        {
          method: 'DELETE',
        }
      )
      return data
    } catch (error) {
      console.error('Error deleting producto:', error)
      throw error
    }
  }
}

export const productoService = new ProductoService()
