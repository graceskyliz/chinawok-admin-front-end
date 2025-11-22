'use client'

import { useEffect, useState } from 'react'
import { analyticsService, ProductAnalytics, PersonalAnalytics, DailyAnalytics } from '@/lib/services/analytics-service'
import { TrendingUp, Users, Package, Clock } from 'lucide-react'
import { useLocalId } from '@/hooks/use-local-id'

export default function Analytics() {
  const localId = useLocalId()
  const [products, setProducts] = useState<ProductAnalytics[]>([])
  const [personal, setPersonal] = useState<PersonalAnalytics[]>([])
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

  return (
    <div className="space-y-6">
      {/* Daily Overview */}
      {dailyData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="text-blue-600" size={20} />
              </div>
              <h3 className="font-semibold text-gray-900">Fecha</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{dailyData.fecha}</p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package className="text-orange-600" size={20} />
              </div>
              <h3 className="font-semibold text-gray-900">Pedidos del Día</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{dailyData.total_pedidos}</p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <h3 className="font-semibold text-gray-900">Ingresos del Día</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">S/. {dailyData.ingresos_totales?.toFixed(2) || '0.00'}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package size={20} className="text-red-600" />
            Top Productos
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {products.length > 0 ? (
              products.map((product, index) => (
                <div key={product.producto_id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{product.nombre}</p>
                        {product.categoria && (
                          <p className="text-xs text-gray-500">{product.categoria}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{product.cantidad_vendida} vendidos</p>
                      <p className="text-sm text-green-600">S/. {product.ingresos_totales?.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No hay datos de productos disponibles</p>
            )}
          </div>
        </div>

        {/* Personal Performance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            Rendimiento del Personal
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {personal.length > 0 ? (
              personal.map((empleado) => (
                <div key={empleado.empleado_id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{empleado.nombre}</p>
                      <p className="text-xs text-gray-500">{empleado.rol}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{empleado.pedidos_atendidos} pedidos</p>
                      {empleado.calificacion_promedio && (
                        <p className="text-xs text-yellow-600">★ {empleado.calificacion_promedio.toFixed(1)}</p>
                      )}
                    </div>
                  </div>
                  {empleado.horas_trabajadas && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock size={12} />
                      <span>{empleado.horas_trabajadas} horas trabajadas</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No hay datos de personal disponibles</p>
            )}
          </div>
        </div>
      </div>

      {/* Hourly Distribution */}
      {dailyData?.pedidos_por_hora && Object.keys(dailyData.pedidos_por_hora).length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Distribución de Pedidos por Hora</h3>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
            {Object.entries(dailyData.pedidos_por_hora).map(([hora, cantidad]) => (
              <div key={hora} className="text-center">
                <div 
                  className="bg-red-600 rounded-t"
                  style={{ 
                    height: `${Math.max((cantidad / Math.max(...Object.values(dailyData.pedidos_por_hora!))) * 100, 10)}px`,
                    minHeight: '10px'
                  }}
                ></div>
                <p className="text-xs text-gray-600 mt-1">{hora}h</p>
                <p className="text-xs font-semibold text-gray-900">{cantidad}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
