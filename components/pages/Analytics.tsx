'use client'

import { useEffect, useState } from 'react'
import { analyticsService, ProductAnalytics, PersonalAnalytics, DailyAnalytics } from '@/lib/services/analytics-service'
import { TrendingUp, Users, Package, Clock, Star, DollarSign, Calendar, Award } from 'lucide-react'
import { useLocalId } from '@/hooks/use-local-id'

export default function Analytics() {
  const localId = useLocalId()
  const [products, setProducts] = useState<ProductAnalytics | null>(null)
  const [personal, setPersonal] = useState<PersonalAnalytics | null>(null)
  const [dailyData, setDailyData] = useState<DailyAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!localId) {
        setIsLoading(false)
        return
      }

      try {
        const [productsData, personalData, daily] = await Promise.all([
          analyticsService.getProductAnalytics(localId),
          analyticsService.getPersonalAnalytics(localId),
          analyticsService.getDailyAnalytics(localId)
        ])
        
        setProducts(productsData)
        setPersonal(personalData)
        setDailyData(daily)
      } catch (err) {
        console.error('Error fetching analytics:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar analítica')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [localId])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-72 bg-gray-200 rounded"></div>
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
        <p className="text-red-500 text-xs mt-2">Asegúrate de que CORS esté habilitado en el backend</p>
      </div>
    )
  }

  // Calculate totals for daily data
  const totalRevenue = dailyData?.record_diario.reduce((sum, day) => sum + parseFloat(day.revenue_diario), 0) || 0
  const totalOrders = dailyData?.record_diario.reduce((sum, day) => sum + parseInt(day.total_pedidos), 0) || 0
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Users size={24} />
            <h3 className="font-semibold">Total Empleados</h3>
          </div>
          <p className="text-3xl font-bold">{personal?.total_empleados || 0}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign size={24} />
            <h3 className="font-semibold">Revenue Total</h3>
          </div>
          <p className="text-3xl font-bold">S/. {totalRevenue.toFixed(2)}</p>
          <p className="text-sm opacity-90 mt-1">{dailyData?.total_dias || 0} días</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Package size={24} />
            <h3 className="font-semibold">Pedidos Totales</h3>
          </div>
          <p className="text-3xl font-bold">{totalOrders}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp size={24} />
            <h3 className="font-semibold">Ticket Promedio</h3>
          </div>
          <p className="text-3xl font-bold">S/. {avgTicket.toFixed(2)}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package size={20} className="text-red-600" />
            Top {products?.total_productos || 0} Productos Más Vendidos
          </h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {products?.productos && products.productos.length > 0 ? (
              products.productos.map((product, index) => (
                <div key={`${product.producto_nombre}-${index}`} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{product.producto_nombre}</p>
                        <p className="text-xs text-gray-500">{product.categoria}</p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-green-600">S/. {parseFloat(product.revenue_total).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{product.porcentaje_ventas}% ventas</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Unidades</p>
                      <p className="font-semibold text-sm text-gray-900">{product.unidades_vendidas}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Precio</p>
                      <p className="font-semibold text-sm text-gray-900">S/. {parseFloat(product.precio_unitario_actual).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Stock</p>
                      <p className="font-semibold text-sm text-gray-900">{product.stock_disponible}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No hay datos de productos disponibles</p>
            )}
          </div>
        </div>

        {/* Best Personal */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award size={20} className="text-blue-600" />
            Mejor Personal (Top {personal?.empleados.length || 0})
          </h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {personal?.empleados && personal.empleados.length > 0 ? (
              personal.empleados.map((empleado, index) => (
                <div key={empleado.dni} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:from-blue-100 hover:to-purple-100 transition border border-blue-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900">{empleado.nombre_completo}</p>
                        <p className="text-xs text-gray-600">{empleado.rol} • DNI: {empleado.dni}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-semibold text-gray-900">{parseFloat(empleado.calificacion_promedio).toFixed(2)}</span>
                            <span className="text-xs text-gray-500">({empleado.total_resenas} reseñas)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="bg-white rounded-lg px-3 py-1 border border-blue-200">
                        <p className="text-xs text-gray-500">Score</p>
                        <p className="text-lg font-bold text-blue-600">{parseFloat(empleado.score_performance).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-blue-200">
                    <div>
                      <p className="text-xs text-gray-600">Pedidos</p>
                      <p className="font-semibold text-sm text-gray-900">{empleado.pedidos_atendidos}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Revenue</p>
                      <p className="font-semibold text-sm text-green-600">S/. {parseFloat(empleado.revenue_generado).toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Sueldo</p>
                      <p className="font-semibold text-sm text-gray-900">S/. {parseFloat(empleado.sueldo_mensual).toFixed(0)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No hay datos de personal disponibles</p>
            )}
          </div>
        </div>
      </div>

      {/* Daily Records */}
      {dailyData?.record_diario && dailyData.record_diario.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-green-600" />
            Record Diario - {dailyData.month}/{dailyData.year}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fecha</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Pedidos</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Revenue Diario</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Ticket Promedio</th>
                </tr>
              </thead>
              <tbody>
                {dailyData.record_diario.map((day, index) => (
                  <tr key={day.fecha} className={`border-b border-gray-100 hover:bg-gray-50 ${index === 0 ? 'bg-green-50' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <span className="font-medium text-gray-900">{day.fecha}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {day.total_pedidos} pedidos
                      </span>
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className="font-bold text-green-600">S/. {parseFloat(day.revenue_diario).toFixed(2)}</span>
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className="font-semibold text-gray-900">S/. {parseFloat(day.ticket_promedio).toFixed(2)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-bold">
                  <td className="py-3 px-4 text-gray-900">Total ({dailyData.total_dias} días)</td>
                  <td className="text-right py-3 px-4 text-gray-900">{totalOrders} pedidos</td>
                  <td className="text-right py-3 px-4 text-green-600">S/. {totalRevenue.toFixed(2)}</td>
                  <td className="text-right py-3 px-4 text-gray-900">S/. {avgTicket.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
