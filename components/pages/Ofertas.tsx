'use client'

import { useEffect, useState } from 'react'
import { useLocalId } from '@/hooks/use-local-id'
import { ofertaService, Oferta } from '@/lib/services/oferta-service'
import { Tag, Calendar, Percent, Package, Utensils, Plus, Edit, Trash2, Clock, X } from 'lucide-react'

type TipoOferta = 'producto' | 'combo'

export default function Ofertas() {
  const localId = useLocalId()
  const [ofertas, setOfertas] = useState<Oferta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedOferta, setSelectedOferta] = useState<Oferta | null>(null)
  const [editFormData, setEditFormData] = useState({
    producto_nombre: '',
    porcentaje_descuento: 0,
    fecha_limite: ''
  })
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    tipo: 'producto' as TipoOferta,
    producto_nombre: '',
    combo_id: '',
    porcentaje_descuento: 10,
    fecha_inicio: '',
    fecha_limite: ''
  })

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

  const resetCreateForm = () => {
    setCreateFormData({
      tipo: 'producto',
      producto_nombre: '',
      combo_id: '',
      porcentaje_descuento: 10,
      fecha_inicio: '',
      fecha_limite: ''
    })
  }

  const handleOpenCreateModal = () => {
    resetCreateForm()
    setIsCreateModalOpen(true)
  }

  const handleCreateOferta = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!localId) {
      alert('No se pudo obtener el ID del local')
      return
    }

    if (createFormData.tipo === 'producto' && !createFormData.producto_nombre.trim()) {
      alert('Debes ingresar el nombre del producto')
      return
    }

    if (createFormData.tipo === 'combo' && !createFormData.combo_id.trim()) {
      alert('Debes ingresar el ID del combo')
      return
    }

    if (!createFormData.fecha_inicio || !createFormData.fecha_limite) {
      alert('Debes seleccionar la fecha de inicio y fin')
      return
    }

    const fechaInicio = new Date(createFormData.fecha_inicio)
    const fechaLimite = new Date(createFormData.fecha_limite)

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaLimite.getTime())) {
      alert('Las fechas seleccionadas no son válidas')
      return
    }

    if (fechaLimite <= fechaInicio) {
      alert('La fecha límite debe ser posterior a la fecha de inicio')
      return
    }

    if (createFormData.porcentaje_descuento < 1 || createFormData.porcentaje_descuento > 100) {
      alert('El porcentaje debe estar entre 1 y 100')
      return
    }

    setIsCreating(true)
    try {
      const payload = {
        local_id: localId,
        porcentaje_descuento: createFormData.porcentaje_descuento,
        fecha_inicio: fechaInicio.toISOString(),
        fecha_limite: fechaLimite.toISOString(),
        ...(createFormData.tipo === 'producto'
          ? { producto_nombre: createFormData.producto_nombre.trim() }
          : { combo_id: createFormData.combo_id.trim() })
      }

      const response = await ofertaService.createOferta(payload)
      setOfertas((prev) => [response.data, ...prev])
      alert('Oferta creada exitosamente')
      setIsCreateModalOpen(false)
      resetCreateForm()
    } catch (error) {
      console.error('Error al crear oferta:', error)
      alert(error instanceof Error ? error.message : 'Error al crear oferta')
    } finally {
      setIsCreating(false)
    }
  }

  const handleOpenEditModal = (oferta: Oferta) => {
    setSelectedOferta(oferta)
    // Formatear fecha para input datetime-local
    const fechaLimite = new Date(oferta.fecha_limite)
    const fechaFormateada = fechaLimite.toISOString().slice(0, 16)
    
    setEditFormData({
      producto_nombre: oferta.producto_nombre || '',
      porcentaje_descuento: parseFloat(oferta.porcentaje_descuento),
      fecha_limite: fechaFormateada
    })
    setIsEditModalOpen(true)
  }

  const handleUpdateOferta = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!localId || !selectedOferta) {
      alert('No se pudo obtener el ID del local o la oferta')
      return
    }

    setIsUpdating(true)
    try {
      // Convertir fecha local a formato ISO
      const fechaLimiteISO = new Date(editFormData.fecha_limite).toISOString()
      
      const response = await ofertaService.updateOferta({
        local_id: localId,
        oferta_id: selectedOferta.oferta_id,
        producto_nombre: editFormData.producto_nombre || undefined,
        porcentaje_descuento: editFormData.porcentaje_descuento,
        fecha_limite: fechaLimiteISO
      })
      
      // Actualizar la oferta en la lista
      setOfertas(ofertas.map(o => 
        o.oferta_id === selectedOferta.oferta_id
          ? {
              ...o,
              producto_nombre: response.data.producto_nombre,
              porcentaje_descuento: response.data.porcentaje_descuento,
              fecha_limite: response.data.fecha_limite
            }
          : o
      ))
      
      alert('Oferta actualizada exitosamente')
      setIsEditModalOpen(false)
      setSelectedOferta(null)
    } catch (error) {
      console.error('Error al actualizar oferta:', error)
      alert(error instanceof Error ? error.message : 'Error al actualizar oferta')
    } finally {
      setIsUpdating(false)
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
        <button
          onClick={handleOpenCreateModal}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 font-medium"
        >
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
                  <button 
                    onClick={() => handleOpenEditModal(oferta)}
                    className="flex-1 py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition flex items-center justify-center gap-2 font-medium"
                  >
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
          <button
            onClick={handleOpenCreateModal}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition inline-flex items-center gap-2 font-medium"
          >
            <Plus size={20} />
            Crear Oferta
          </button>
        </div>
      )}

      {/* Modal de Creación */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Crear Oferta</h2>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false)
                  resetCreateForm()
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleCreateOferta} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Oferta *
                </label>
                <select
                  value={createFormData.tipo}
                  onChange={(e) =>
                    setCreateFormData((prev) => ({
                      ...prev,
                      tipo: e.target.value as TipoOferta
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="producto">Producto</option>
                  <option value="combo">Combo</option>
                </select>
              </div>

              {createFormData.tipo === 'producto' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    value={createFormData.producto_nombre}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        producto_nombre: e.target.value
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Arroz Chaufa Mixto"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID del Combo *
                  </label>
                  <input
                    type="text"
                    value={createFormData.combo_id}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        combo_id: e.target.value
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="6f06922e-..."
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Inicio *
                  </label>
                  <input
                    type="datetime-local"
                    value={createFormData.fecha_inicio}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        fecha_inicio: e.target.value
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Límite *
                  </label>
                  <input
                    type="datetime-local"
                    value={createFormData.fecha_limite}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        fecha_limite: e.target.value
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Porcentaje de Descuento *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={createFormData.porcentaje_descuento}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        porcentaje_descuento: Number(e.target.value)
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                  <Percent size={20} className="absolute right-3 top-2.5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Entre 1% y 100%</p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false)
                    resetCreateForm()
                  }}
                  className="flex-1 px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creando...
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      Crear Oferta
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      {isEditModalOpen && selectedOferta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Editar Oferta</h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false)
                  setSelectedOferta(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateOferta} className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div>
                  <p className="text-xs text-gray-500">ID de Oferta</p>
                  <p className="text-sm font-mono text-gray-900">{selectedOferta.oferta_id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tipo</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedOferta.producto_nombre ? `Producto: ${selectedOferta.producto_nombre}` : `Combo: ${selectedOferta.combo_id}`}
                  </p>
                </div>
              </div>

              {selectedOferta.producto_nombre && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Producto
                  </label>
                  <input
                    type="text"
                    value={editFormData.producto_nombre}
                    onChange={(e) => setEditFormData({ ...editFormData, producto_nombre: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Nombre del producto"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Porcentaje de Descuento *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={editFormData.porcentaje_descuento}
                    onChange={(e) => setEditFormData({ ...editFormData, porcentaje_descuento: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <Percent size={20} className="absolute right-3 top-2.5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Descuento actual: {selectedOferta.porcentaje_descuento}%
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Límite *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={editFormData.fecha_limite}
                  onChange={(e) => setEditFormData({ ...editFormData, fecha_limite: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Fecha actual: {formatDate(selectedOferta.fecha_limite)}
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setSelectedOferta(null)
                  }}
                  className="flex-1 px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Edit size={20} />
                      Actualizar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
