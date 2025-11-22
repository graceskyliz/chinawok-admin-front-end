'use client'

import { useEffect, useState } from 'react'
import { Star, MessageSquare, TrendingUp, Users } from 'lucide-react'
import { useLocalId } from '@/hooks/use-local-id'
import { resenaService, Resena } from '@/lib/services/resena-service'

export default function Resenas() {
  const localId = useLocalId()
  const [resenas, setResenas] = useState<Resena[]>([])
  const [totalResenas, setTotalResenas] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchResenas = async () => {
      if (!localId) {
        setError('No se pudo obtener el ID del local. Solo los gerentes pueden ver reseñas.')
        setIsLoading(false)
        return
      }

      try {
        const response = await resenaService.getResenasByLocal(localId)
        setResenas(response.resenas || [])
        setTotalResenas(response.total_resenas || 0)
      } catch (err) {
        console.error('Error fetching resenas:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar reseñas')
      } finally {
        setIsLoading(false)
      }
    }

    fetchResenas()
  }, [localId])

  const calcularPromedioCalificacion = () => {
    if (resenas.length === 0) return 0
    const suma = resenas.reduce((acc, r) => acc + r.calificacion, 0)
    return (suma / resenas.length).toFixed(2)
  }

  const contarPorCalificacion = (min: number, max: number) => {
    return resenas.filter(r => r.calificacion >= min && r.calificacion < max).length
  }

  const calificacion5Estrellas = contarPorCalificacion(4.5, 5.1)
  const calificacion4Estrellas = contarPorCalificacion(3.5, 4.5)
  const calificacion3Estrellas = contarPorCalificacion(2.5, 3.5)
  const calificacionBaja = contarPorCalificacion(0, 2.5)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        <p className="text-red-500 text-xs mt-2">Asegúrate de que CORS esté habilitado en el backend</p>
      </div>
    )
  }

  if (!localId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-700 text-sm">Solo los gerentes pueden ver las reseñas de su local.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="text-yellow-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-900">Calificación Promedio</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{calcularPromedioCalificacion()}</p>
          <p className="text-sm text-gray-500 mt-1">de 5.0 estrellas</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="text-blue-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-900">Total Reseñas</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalResenas}</p>
          <p className="text-sm text-gray-500 mt-1">opiniones recibidas</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-900">Reseñas Positivas</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{calificacion5Estrellas + calificacion4Estrellas}</p>
          <p className="text-sm text-gray-500 mt-1">4+ estrellas</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <Users className="text-red-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-900">Reseñas Negativas</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{calificacionBaja}</p>
          <p className="text-sm text-gray-500 mt-1">menos de 2.5 estrellas</p>
        </div>
      </div>

      {/* Distribución de Calificaciones */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Distribución de Calificaciones</h3>
        <div className="space-y-3">
          {[
            { stars: 5, count: calificacion5Estrellas, color: 'bg-green-500' },
            { stars: 4, count: calificacion4Estrellas, color: 'bg-blue-500' },
            { stars: 3, count: calificacion3Estrellas, color: 'bg-yellow-500' },
            { stars: '< 3', count: calificacionBaja, color: 'bg-red-500' }
          ].map((item) => {
            const percentage = totalResenas > 0 ? (item.count / totalResenas) * 100 : 0
            return (
              <div key={item.stars} className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  {item.stars}
                </div>
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-16 text-sm text-gray-600 text-right">
                  {item.count} ({percentage.toFixed(0)}%)
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Lista de Reseñas */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Reseñas Recientes</h3>
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {resenas.length > 0 ? (
            resenas.map((resena) => (
              <div key={resena.resena_id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={`${
                            i < Math.floor(resena.calificacion)
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {resena.calificacion.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">Pedido: {resena.pedido_id.slice(0, 8)}...</span>
                </div>
                
                <p className="text-gray-700 mb-3">{resena.resena}</p>
                
                <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    Cocinero: {resena.cocinero_dni}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                    Repartidor: {resena.repartidor_dni}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                    Despachador: {resena.despachador_dni}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <MessageSquare size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay reseñas disponibles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
