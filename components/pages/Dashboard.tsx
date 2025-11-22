'use client'

import { TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react'
import { useEffect, useState } from 'react'
import { analyticsService, StatisticsAnalytics, ProductAnalytics } from '@/lib/services/analytics-service'
import { useLocalId } from '@/hooks/use-local-id'

export default function Dashboard() {
  const localId = useLocalId()
  const [statistics, setStatistics] = useState<StatisticsAnalytics | null>(null)
  const [topProducts, setTopProducts] = useState<ProductAnalytics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      if (!localId) {
        setIsLoading(false)
        return
      }

      try {
        const [stats, products] = await Promise.all([
          analyticsService.getStatistics(localId),
          analyticsService.getProductAnalytics(localId)
        ])
        
        setStatistics(stats)
        setTopProducts(products.slice(0, 4)) // Top 4 products
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar datos')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [localId])

  const stats = statistics ? [
    {
      label: 'Ventas del Día',
      value: `S/. ${statistics.ventas_del_dia?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'bg-red-600',
      trend: statistics.tendencia_ventas || '+0%'
    },
    {
      label: 'Pedidos',
      value: statistics.pedidos_totales?.toString() || '0',
      icon: ShoppingCart,
      color: 'bg-orange-600',
      trend: statistics.tendencia_pedidos || '+0%'
    },
    {
      label: 'Nuevos Clientes',
      value: statistics.nuevos_clientes?.toString() || '0',
      icon: Users,
      color: 'bg-green-600',
      trend: statistics.tendencia_clientes || '+0%'
    },
    {
      label: 'Ingresos Mensuales',
      value: `S/. ${statistics.ingresos_mensuales?.toFixed(2) || '0.00'}`,
      icon: TrendingUp,
      color: 'bg-blue-600',
      trend: statistics.tendencia_ingresos || '+0%'
    }
  ] : []

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
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

        {/* Top Dishes */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Platos Top</h3>
          <div className="space-y-4">
            {topProducts.length > 0 ? (
              topProducts.map((product) => {
                const maxSold = topProducts[0]?.cantidad_vendida || 1
                return (
                  <div key={product.producto_id}>
                    <div className="flex justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900">{product.nombre}</p>
                      <p className="text-sm font-semibold text-red-600">{product.cantidad_vendida}</p>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-600 rounded-full"
                        style={{ width: `${(product.cantidad_vendida / maxSold) * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-gray-500">No hay datos disponibles</p>
            )}
          </div>
        </div>
      </div>

      {/* Promotions Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Promociones Activas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'ChinaWeek', discount: '40% OFF', active: true },
            { name: 'Encaje al Wok', discount: '30% OFF', active: true },
            { name: 'Banquetazo', discount: '25% OFF', active: false }
          ].map((promo) => (
            <div key={promo.name} className={`p-4 rounded-lg border-2 ${
              promo.active ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'
            }`}>
              <p className="font-semibold text-gray-900">{promo.name}</p>
              <p className="text-sm text-gray-600 mb-2">{promo.discount}</p>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                promo.active ? 'bg-green-200 text-green-700' : 'bg-gray-200 text-gray-700'
              }`}>
                {promo.active ? 'Activa' : 'Pausada'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
