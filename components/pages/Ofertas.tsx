'use client'

import { useEffect, useState } from 'react'
import { useLocalId } from '@/hooks/use-local-id'
import { ofertaService, Oferta } from '@/lib/services/oferta-service'
import { Tag, Calendar, Percent, Package, Utensils, Plus, Edit, Trash2, Clock } from 'lucide-react'

export default function Ofertas() {
  const localId = useLocalId()
  const [ofertas, setOfertas] = useState<Oferta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchOfertas = async () => {
      if (!localId) {
        setError('No se pudo obtener el ID del local. Solo los gerentes pueden ver ofertas.')
        setIsLoading(false)
        return
      }

      try {
        const response = await ofertaService.getOfertasByLocal(localId)
        setOfertas(response.data || [])
      } catch (err) {
        console.error('Error fetching ofertas:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar ofertas')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOfertas()
  }, [localId])

  // Función para verificar si la oferta está activa
  const isOfertaActiva = (oferta: Oferta) => {
    const now = new Date()
    const inicio = new Date(oferta.fecha_inicio)
    const limite = new Date(oferta.fecha_limite)
    return now >= inicio && now <= limite
  }

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-PE', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Función para eliminar oferta
  const handleDeleteOferta = async (ofertaId: string) => {
    if (!localId) {
      alert('No se pudo obtener el ID del local')
      return
    }

    if (!confirm('¿Estás seguro de que deseas eliminar esta oferta?')) {
      return
    }

    setDeletingId(ofertaId)
    try {
      await ofertaService.deleteOferta(localId, ofertaId)
      setOfertas(ofertas.filter(o => o.oferta_id !== ofertaId))
      alert('Oferta eliminada exitosamente')
    } catch (error) {
      console.error('Error al eliminar oferta:', error)
      alert(error instanceof Error ? error.message : 'Error al eliminar oferta')
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-48 bg-gray-200 rounded"></div>
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
        <p className="text-yellow-700 text-sm">Solo los gerentes pueden ver las ofertas de su local.</p>
      </div>
    )
  }

  // Estadísticas
  const totalOfertas = ofertas.length
  const ofertasActivas = ofertas.filter(o => isOfertaActiva(o)).length
  const ofertasProductos = ofertas.filter(o => o.producto_nombre).length
  const ofertasCombos = ofertas.filter(o => o.combo_id).length

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Tag className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Ofertas</p>
              <p className="text-2xl font-bold text-gray-900">{totalOfertas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Activas</p>
              <p className="text-2xl font-bold text-gray-900">{ofertasActivas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Utensils className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Productos</p>
              <p className="text-2xl font-bold text-gray-900">{ofertasProductos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Package className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Combos</p>
              <p className="text-2xl font-bold text-gray-900">{ofertasCombos}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header con botón */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ofertas y Promociones</h2>
          <p className="text-sm text-gray-500 mt-1">Gestiona los descuentos del local</p>
        </div>
        <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 font-medium">
          <Plus size={20} />
          Nueva Oferta
        </button>
      </div>

      {/* Ofertas Grid */}
      {ofertas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ofertas.map((oferta) => {
            const activa = isOfertaActiva(oferta)
            return (
              <div
                key={oferta.oferta_id}
                className={`bg-white rounded-lg border-2 p-6 hover:shadow-lg transition-all ${
                  activa ? 'border-green-200 bg-green-50/30' : 'border-gray-200'
                }`}
              >
                {/* Badge de descuento */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {oferta.producto_nombre ? (
                      <Utensils className="text-orange-600" size={20} />
                    ) : (
                      <Package className="text-blue-600" size={20} />
                    )}
                    <span className="text-sm font-medium text-gray-600">
                      {oferta.producto_nombre ? 'Producto' : 'Combo'}
                    </span>
                  </div>
                  <div className="bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-1">
                    <Percent size={20} />
                    <span className="text-2xl font-bold">{oferta.porcentaje_descuento}</span>
                  </div>
                </div>

                {/* Nombre del producto/combo */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <h3 className="font-bold text-gray-900 text-lg">
                    {oferta.producto_nombre || `Combo ID: ${oferta.combo_id?.substring(0, 8)}...`}
                  </h3>
                  {activa ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium mt-2">
                      <Clock size={12} />
                      Activa
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium mt-2">
                      <Clock size={12} />
                      Inactiva
                    </span>
                  )}
                </div>

                {/* Fechas */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-gray-600">Inicio:</span>
                    <span className="font-medium text-gray-900">{formatDate(oferta.fecha_inicio)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-gray-600">Fin:</span>
                    <span className="font-medium text-gray-900">{formatDate(oferta.fecha_limite)}</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2">
                  <button className="flex-1 py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition flex items-center justify-center gap-2 font-medium">
                    <Edit size={16} />
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDeleteOferta(oferta.oferta_id)}
                    disabled={deletingId === oferta.oferta_id}
                    className="flex-1 py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === oferta.oferta_id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Eliminar
                      </>
                    )}
                  </button>
                </div>

                {/* ID de la oferta */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-400">ID: {oferta.oferta_id}</p>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <Tag size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay ofertas registradas</h3>
          <p className="text-sm text-gray-600 mb-4">Crea tu primera oferta para empezar</p>
          <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition inline-flex items-center gap-2 font-medium">
            <Plus size={20} />
            Crear Oferta
          </button>
        </div>
      )}
    </div>
  )
}
