'use client'

import { TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react'
import { useEffect, useState } from 'react'
import { analyticsService, StatisticsAnalytics } from '@/lib/services/analytics-service'
import { pedidoService } from '@/lib/services/pedido-service'
import { useLocalId } from '@/hooks/use-local-id'

export default function Dashboard() {
  const localId = useLocalId()
  const [statistics, setStatistics] = useState<StatisticsAnalytics | null>(null)
  const [totalPedidos, setTotalPedidos] = useState(0)
  const [ingresosTotal, setIngresosTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      if (!localId) {
        setIsLoading(false)
        return
      }

      try {
        const [stats, pedidosResponse] = await Promise.all([
          analyticsService.getStatistics(localId),
          pedidoService.getPedidosByLocal(localId)
        ])
        
        setStatistics(stats)
        setTotalPedidos(pedidosResponse.data.length)
        
        // Calculate total revenue from all orders
        const totalIngresos = pedidosResponse.data.reduce((sum, pedido) => {
          const costo = typeof pedido.costo === 'number' ? pedido.costo : parseFloat(pedido.costo || '0')
          return sum + costo
        }, 0)
        setIngresosTotal(totalIngresos)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar datos')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [localId])

  const estadisticas = statistics?.estadisticas
  const stats = estadisticas ? [
    {
      label: 'Revenue Total',
      value: `S/. ${parseFloat(estadisticas.revenue_total || '0').toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-red-600',
      trend: `${estadisticas.tasa_completado_pct || '0'}% completados`
    },
    {
      label: 'Total Pedidos',
      value: estadisticas.total_pedidos || '0',
      icon: ShoppingCart,
      color: 'bg-orange-600',
      trend: `${estadisticas.pedidos_completados || '0'} completados`
    },
    {
      label: 'Ticket Promedio',
      value: `S/. ${parseFloat(estadisticas.ticket_promedio || '0').toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-blue-600',
      trend: `${estadisticas.clientes_unicos || '0'} clientes`
    }
  ] : []

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
                <span className="text-green-600 text-sm font-semibold">{stat.trend}</span>
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Pedidos Recientes</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div>
                  <p className="font-semibold text-gray-900">Pedido #{1000 + i}</p>
                  <p className="text-sm text-gray-500">Arroz Chaufa + Tallarín Saltado</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">S/. {25 + i * 5}</p>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    i % 2 === 0 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {i % 2 === 0 ? 'Entregado' : 'En Camino'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
