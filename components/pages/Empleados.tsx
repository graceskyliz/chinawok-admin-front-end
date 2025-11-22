'use client'

import { useEffect, useState } from 'react'
import { useLocalId } from '@/hooks/use-local-id'
import { localService } from '@/lib/services/local-service'
import { User, DollarSign, Briefcase, Star, CreditCard, CheckCircle, XCircle } from 'lucide-react'

interface Empleado {
  local_id: string
  nombre: string
  apellido: string
  role: string
  ocupado: boolean
  sueldo: number
  calificacion_prom: number
  dni: string
}

export default function Empleados() {
  const localId = useLocalId()
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEmpleados = async () => {
      if (!localId) {
        setError('No se pudo obtener el ID del local. Solo los gerentes pueden ver empleados.')
        setIsLoading(false)
        return
      }

      try {
        const data = await localService.getEmpleadosByLocal(localId)
        setEmpleados(data || [])
      } catch (err) {
        console.error('Error fetching empleados:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar empleados')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmpleados()
  }, [localId])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
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
        <p className="text-yellow-700 text-sm">Solo los gerentes pueden ver la lista de empleados de su local.</p>
      </div>
    )
  }

  // Estadísticas generales
  const totalEmpleados = empleados.length
  const empleadosOcupados = empleados.filter(e => e.ocupado).length
  const promedioCalificacion = empleados.length > 0 
    ? (empleados.reduce((sum, e) => sum + e.calificacion_prom, 0) / empleados.length).toFixed(2)
    : '0.00'
  const totalSueldos = empleados.reduce((sum, e) => sum + e.sueldo, 0).toFixed(2)

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Empleados</p>
              <p className="text-2xl font-bold text-gray-900">{totalEmpleados}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ocupados</p>
              <p className="text-2xl font-bold text-gray-900">{empleadosOcupados}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Calificación Prom.</p>
              <p className="text-2xl font-bold text-gray-900">{promedioCalificacion}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <DollarSign className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Sueldos</p>
              <p className="text-2xl font-bold text-gray-900">S/. {totalSueldos}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Empleados Grid */}
      {empleados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {empleados.map((empleado) => (
            <div
              key={empleado.dni}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Avatar and Name */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {empleado.nombre.charAt(0).toUpperCase()}
                  {empleado.apellido.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">
                    {empleado.nombre} {empleado.apellido}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Briefcase size={14} className="text-red-600" />
                    <span className="text-sm font-medium text-red-600">{empleado.role}</span>
                  </div>
                </div>
              </div>

              {/* Employee Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">DNI</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{empleado.dni}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">Sueldo</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">S/. {empleado.sueldo.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm text-gray-600">Calificación</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{empleado.calificacion_prom.toFixed(2)}</span>
                </div>

                {/* Estado */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Estado</span>
                    <div className="flex items-center gap-2">
                      {empleado.ocupado ? (
                        <>
                          <CheckCircle size={16} className="text-green-600" />
                          <span className="text-sm font-medium text-green-600">Ocupado</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">Disponible</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <User size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay empleados registrados</h3>
          <p className="text-sm text-gray-600">Aún no hay empleados asignados a este local.</p>
        </div>
      )}
    </div>
  )
}
