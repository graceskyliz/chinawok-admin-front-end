'use client'

import { useEffect, useState } from 'react'
import { useLocalId } from '@/hooks/use-local-id'
import { comboService, Combo } from '@/lib/services/combo-service'
import { Package, DollarSign, CheckCircle, XCircle, Grid3x3, Plus, Edit, Trash2, X } from 'lucide-react'

export default function Combos() {
  const localId = useLocalId()
  const [combos, setCombos] = useState<Combo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState({
    nombre: '',
    descripcion: '',
    productos_nombres: [] as string[]
  })
  const [newProductInput, setNewProductInput] = useState('')

  useEffect(() => {
    const fetchCombos = async () => {
      if (!localId) {
        setError('No se pudo obtener el ID del local. Solo los gerentes pueden ver combos.')
        setIsLoading(false)
        return
      }

      try {
        const response = await comboService.getCombosByLocal(localId)
        setCombos(response.data || [])
      } catch (err) {
        console.error('Error fetching combos:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar combos')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCombos()
  }, [localId])

  const handleOpenEditModal = (combo: Combo) => {
    setSelectedCombo(combo)
    setEditFormData({
      nombre: combo.nombre,
      descripcion: combo.descripcion || '',
      productos_nombres: [...combo.productos_nombres]
    })
    setIsEditModalOpen(true)
  }

  const handleAddProduct = () => {
    if (newProductInput.trim()) {
      setEditFormData({
        ...editFormData,
        productos_nombres: [...editFormData.productos_nombres, newProductInput.trim()]
      })
      setNewProductInput('')
    }
  }

  const handleRemoveProduct = (index: number) => {
    setEditFormData({
      ...editFormData,
      productos_nombres: editFormData.productos_nombres.filter((_, i) => i !== index)
    })
  }

  const handleUpdateCombo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!localId || !selectedCombo) {
      alert('No se pudo obtener el ID del local o el combo')
      return
    }

    if (editFormData.productos_nombres.length === 0) {
      alert('Debe agregar al menos un producto al combo')
      return
    }

    setIsUpdating(true)
    try {
      const response = await comboService.updateCombo({
        local_id: localId,
        combo_id: selectedCombo.combo_id,
        nombre: editFormData.nombre,
        descripcion: editFormData.descripcion,
        productos_nombres: editFormData.productos_nombres
      })
      
      // Actualizar el combo en la lista
      setCombos(combos.map(c => 
        c.combo_id === selectedCombo.combo_id
          ? {
              ...c,
              nombre: response.data.nombre,
              descripcion: response.data.descripcion,
              productos_nombres: response.data.productos_nombres
            }
          : c
      ))
      
      alert('Combo actualizado exitosamente')
      setIsEditModalOpen(false)
      setSelectedCombo(null)
    } catch (error) {
      console.error('Error al actualizar combo:', error)
      alert(error instanceof Error ? error.message : 'Error al actualizar combo')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteCombo = async (comboId: string, comboNombre: string) => {
    if (!localId) {
      alert('No se pudo obtener el ID del local')
      return
    }

    if (!confirm(`¿Estás seguro de que deseas eliminar el combo "${comboNombre}"?`)) {
      return
    }

    setDeletingId(comboId)
    try {
      await comboService.deleteCombo(localId, comboId)
      setCombos(combos.filter(c => c.combo_id !== comboId))
      alert('Combo eliminado exitosamente')
    } catch (error) {
      console.error('Error al eliminar combo:', error)
      alert(error instanceof Error ? error.message : 'Error al eliminar combo')
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
        <p className="text-yellow-700 text-sm">Solo los gerentes pueden ver los combos de su local.</p>
      </div>
    )
  }

  // Estadísticas
  const totalCombos = combos.length
  const combosDisponibles = combos.filter(c => c.disponible).length
  const combosNoDisponibles = combos.filter(c => !c.disponible).length
  const promedioProductos = combos.length > 0
    ? (combos.reduce((sum, c) => sum + c.productos_nombres.length, 0) / combos.length).toFixed(1)
    : '0'

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Combos</p>
              <p className="text-2xl font-bold text-gray-900">{totalCombos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Disponibles</p>
              <p className="text-2xl font-bold text-gray-900">{combosDisponibles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">No Disponibles</p>
              <p className="text-2xl font-bold text-gray-900">{combosNoDisponibles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Grid3x3 className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Promedio Productos</p>
              <p className="text-2xl font-bold text-gray-900">{promedioProductos}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header con botón */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Combos del Local</h2>
          <p className="text-sm text-gray-500 mt-1">Gestiona los combos disponibles</p>
        </div>
        <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 font-medium">
          <Plus size={20} />
          Nuevo Combo
        </button>
      </div>

      {/* Combos Grid */}
      {combos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {combos.map((combo) => (
            <div
              key={combo.combo_id}
              className={`bg-white rounded-lg border-2 p-6 hover:shadow-lg transition-all ${
                combo.disponible ? 'border-green-200' : 'border-gray-200'
              }`}
            >
              {/* Header del combo */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{combo.nombre}</h3>
                  <div className="flex items-center gap-2">
                    {combo.disponible ? (
                      <>
                        <CheckCircle size={16} className="text-green-600" />
                        <span className="text-sm font-medium text-green-600">Disponible</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={16} className="text-red-600" />
                        <span className="text-sm font-medium text-red-600">No Disponible</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">S/. {combo.precio ? parseFloat(combo.precio).toFixed(2) : '0.00'}</p>
                </div>
              </div>

              {/* Productos incluidos */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Package size={16} />
                  Productos incluidos ({combo.productos_nombres.length})
                </p>
                <ul className="space-y-1">
                  {combo.productos_nombres.map((producto, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>{producto}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                <button 
                  onClick={() => handleOpenEditModal(combo)}
                  className="flex-1 py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition flex items-center justify-center gap-2 font-medium"
                >
                  <Edit size={16} />
                  Editar
                </button>
                <button 
                  onClick={() => handleDeleteCombo(combo.combo_id, combo.nombre)}
                  disabled={deletingId === combo.combo_id}
                  className="flex-1 py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingId === combo.combo_id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Eliminar
                    </>
                  )}
                </button>
              </div>

              {/* ID del combo */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-400">ID: {combo.combo_id}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <Package size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay combos registrados</h3>
          <p className="text-sm text-gray-600 mb-4">Crea tu primer combo para empezar</p>
          <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition inline-flex items-center gap-2 font-medium">
            <Plus size={20} />
            Crear Combo
          </button>
        </div>
      )}

      {/* Modal de Edición */}
      {isEditModalOpen && selectedCombo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Editar Combo</h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false)
                  setSelectedCombo(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateCombo} className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500">ID del Combo</p>
                <p className="text-sm font-mono text-gray-900">{selectedCombo.combo_id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Combo *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.nombre}
                  onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Ej: Combo Familiar Plus"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  value={editFormData.descripcion}
                  onChange={(e) => setEditFormData({ ...editFormData, descripcion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Describe el combo..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Productos incluidos * ({editFormData.productos_nombres.length})
                </label>
                
                {/* Lista de productos actuales */}
                {editFormData.productos_nombres.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {editFormData.productos_nombres.map((producto, index) => (
                      <div key={index} className="flex items-center gap-2 bg-blue-50 rounded-lg p-3">
                        <Package size={16} className="text-blue-600" />
                        <span className="flex-1 text-sm font-medium text-gray-900">{producto}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(index)}
                          className="p-1 hover:bg-red-100 text-red-600 rounded transition"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Agregar nuevo producto */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newProductInput}
                    onChange={(e) => setNewProductInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddProduct())}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Nombre del producto"
                  />
                  <button
                    type="button"
                    onClick={handleAddProduct}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ⚠️ La actualización de combos opera como una sobreescritura
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setSelectedCombo(null)
                  }}
                  className="flex-1 px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || editFormData.productos_nombres.length === 0}
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
                      Actualizar Combo
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
