import { getApiUrl } from '@/lib/config/api-config'

// Interfaces for Analytics responses
export interface Empleado {
  local_id: string
  dni: string
  nombre_completo: string
  rol: string
  sueldo_mensual: string
  calificacion_promedio: string
  total_resenas: string
  pedidos_atendidos: string
  revenue_generado: string
  score_performance: string
}

export interface PersonalAnalytics {
  local_id: string
  total_empleados: number
  empleados: Empleado[]
}

export interface RecordDiario {
  local_id: string
  fecha: string
  total_pedidos: string
  revenue_diario: string
  ticket_promedio: string
}

export interface DailyAnalytics {
  local_id: string
  year: number
  month: number
  total_dias: number
  record_diario: RecordDiario[]
}

export interface Producto {
  local_id: string
  producto_nombre: string
  pedidos_que_lo_incluyen: string
  unidades_vendidas: string
  categoria: string
  precio_unitario_actual: string
  revenue_total: string
  stock_disponible: string
  porcentaje_ventas: string
}

export interface ProductAnalytics {
  local_id: string
  total_productos: number
  productos: Producto[]
}

export interface Estadisticas {
  local_id: string
  direccion: string
  telefono: string
  hora_apertura: string
  hora_finalizacion: string
  gerente_nombre: string
  gerente_correo: string
  total_pedidos: string
  clientes_unicos: string
  revenue_total: string
  ticket_promedio: string
  pedido_minimo: string
  pedido_maximo: string
  pedidos_completados: string
  pedidos_en_envio: string
  pedidos_empacando: string
  pedidos_cocinando: string
  pedidos_eligiendo: string
  tasa_completado_pct: string
  total_productos: string
  inventario_total: string
  productos_stock_bajo: string
  productos_sin_stock: string
  total_empleados: string
  cocineros: string
  despachadores: string
  repartidores: string
  calificacion_staff: string
  nomina_mensual: string
  ofertas_activas: string
  descuento_promedio_pct: string
  total_combos: string
  combos_disponibles: string
  total_resenas: string
  calificacion_cliente: string
  resenas_excelentes: string
  resenas_malas: string
}

export interface StatisticsAnalytics {
  local_id: string
  estadisticas: Estadisticas
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

  async getProductAnalytics(localId: string): Promise<ProductAnalytics> {
    try {
      const data = await this.fetchWithAuth(`${this.localesUrl}/analitica/productos`, {
        method: 'POST',
        body: JSON.stringify({ local_id: localId }),
      })
      return data
    } catch (error) {
      console.error('Get product analytics error:', error)
      throw error
    }
  }

  async getPersonalAnalytics(localId: string): Promise<PersonalAnalytics> {
    try {
      const data = await this.fetchWithAuth(`${this.localesUrl}/analitica/personal`, {
        method: 'POST',
        body: JSON.stringify({ local_id: localId }),
      })
      return data
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
