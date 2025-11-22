import { getApiUrl } from '@/lib/config/api-config'

// Interfaces for Analytics responses
export interface ProductAnalytics {
  producto_id: string
  nombre: string
  cantidad_vendida: number
  ingresos_totales: number
  categoria?: string
}

export interface PersonalAnalytics {
  empleado_id: string
  nombre: string
  rol: string
  pedidos_atendidos: number
  calificacion_promedio?: number
  horas_trabajadas?: number
}

export interface DailyAnalytics {
  fecha: string
  total_pedidos: number
  ingresos_totales: number
  pedidos_por_hora?: { [hora: string]: number }
  productos_mas_vendidos?: string[]
}

export interface StatisticsAnalytics {
  ventas_del_dia: number
  pedidos_totales: number
  nuevos_clientes: number
  ingresos_mensuales: number
  tendencia_ventas?: string
  tendencia_pedidos?: string
  tendencia_clientes?: string
  tendencia_ingresos?: string
}

export interface ActivateAnalyticsResponse {
  message: string
  success: boolean
}

class AnalyticsService {
  private get baseUrl(): string {
    // Analytics endpoints are in the pedidos microservice under /workflow
    return getApiUrl('pedidos')
  }

  private get localesUrl(): string {
    // Some analytics might be in locales microservice
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

  async activateAnalytics(): Promise<ActivateAnalyticsResponse> {
    try {
      const data = await this.fetchWithAuth(`${this.baseUrl}/workflow/analitica/activar`, {
        method: 'POST',
      })
      return data
    } catch (error) {
      console.error('Activate analytics error:', error)
      throw error
    }
  }

  async getProductAnalytics(localId: string): Promise<ProductAnalytics[]> {
    try {
      const data = await this.fetchWithAuth(`${this.localesUrl}/analitica/productos`, {
        method: 'POST',
        body: JSON.stringify({ local_id: localId }),
      })
      return data.productos || data
    } catch (error) {
      console.error('Get product analytics error:', error)
      throw error
    }
  }

  async getPersonalAnalytics(localId: string): Promise<PersonalAnalytics[]> {
    try {
      const data = await this.fetchWithAuth(`${this.localesUrl}/analitica/personal`, {
        method: 'POST',
        body: JSON.stringify({ local_id: localId }),
      })
      return data.personal || data
    } catch (error) {
      console.error('Get personal analytics error:', error)
      throw error
    }
  }

  async getDailyAnalytics(localId: string): Promise<DailyAnalytics> {
    try {
      const data = await this.fetchWithAuth(`${this.localesUrl}/analitica/diario`, {
        method: 'POST',
        body: JSON.stringify({ local_id: localId }),
      })
      return data
    } catch (error) {
      console.error('Get daily analytics error:', error)
      throw error
    }
  }

  async getStatistics(localId: string): Promise<StatisticsAnalytics> {
    try {
      const data = await this.fetchWithAuth(`${this.localesUrl}/analitica/estadisticas`, {
        method: 'POST',
        body: JSON.stringify({ local_id: localId }),
      })
      return data
    } catch (error) {
      console.error('Get statistics error:', error)
      throw error
    }
  }
}

export const analyticsService = new AnalyticsService()
