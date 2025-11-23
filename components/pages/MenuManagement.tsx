'use client'

import { Plus, Edit, Trash2, Search, Package, DollarSign, Grid3x3, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useLocalId } from '@/hooks/use-local-id'
import { productoService, Producto, CreateProductoRequest } from '@/lib/services/producto-service'

export default function MenuManagement() {
  const localId = useLocalId()
  const [searchTerm, setSearchTerm] = useState('')
  const [productos, setProductos] = useState<Producto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [deletingNombre, setDeletingNombre] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null)
  const [formData, setFormData] = useState<Omit<CreateProductoRequest, 'local_id'>>({
    nombre: '',
    precio: 0,
    descripcion: '',
    categoria: '',
    stock: 0
  })
  const [editFormData, setEditFormData] = useState({
    precio: 0,
    stock: 0
  })

  useEffect(() => {
    const fetchProductos = async () => {
      if (!localId) {
        setError('No se pudo obtener el ID del local. Solo los gerentes pueden ver productos.')
        setIsLoading(false)
        return
      }

      try {
        const response = await productoService.getProductosByLocal(localId)
        setProductos(response.data || [])
      } catch (err) {
        console.error('Error fetching productos:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar productos')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProductos()
  }, [localId])

  const handleDeleteProducto = async (productoNombre: string) => {
    if (!localId) {
      alert('No se pudo obtener el ID del local')
      return
    }

    if (!confirm(`¿Estás seguro de que deseas eliminar el producto "${productoNombre}"?`)) {
      return
    }

    setDeletingNombre(productoNombre)
    try {
      await productoService.deleteProducto(localId, productoNombre)
      setProductos(productos.filter(p => p.nombre !== productoNombre))
      alert('Producto eliminado exitosamente')
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      alert(error instanceof Error ? error.message : 'Error al eliminar producto')
    } finally {
      setDeletingNombre(null)
    }
  }

  const handleCreateProducto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!localId) {
      alert('No se pudo obtener el ID del local')
      return
    }

    setIsCreating(true)
    try {
      const response = await productoService.createProducto({
        ...formData,
        local_id: localId
      })
      
      // Agregar el nuevo producto a la lista
      setProductos([...productos, {
        local_id: response.data.local_id,
        nombre: response.data.nombre,
        precio: response.data.precio.toString(),
        descripcion: response.data.descripcion,
        categoria: response.data.categoria,
        stock: response.data.stock.toString()
      }])
      
      alert('Producto creado exitosamente')
      setIsModalOpen(false)
      setFormData({
        nombre: '',
        precio: 0,
        descripcion: '',
        categoria: '',
        stock: 0
      })
    } catch (error) {
      console.error('Error al crear producto:', error)
      alert(error instanceof Error ? error.message : 'Error al crear producto')
    } finally {
      setIsCreating(false)
    }
  }

  const handleOpenEditModal = (producto: Producto) => {
    setSelectedProducto(producto)
    setEditFormData({
      precio: parseFloat(producto.precio),
      stock: parseInt(producto.stock)
    })
    setIsEditModalOpen(true)
  }

  const handleUpdateProducto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!localId || !selectedProducto) {
      alert('No se pudo obtener el ID del local o el producto')
      return
    }

    setIsUpdating(true)
    try {
      const response = await productoService.updateProducto({
        local_id: localId,
        nombre: selectedProducto.nombre,
        precio: editFormData.precio,
        stock: editFormData.stock
      })
      
      // Actualizar el producto en la lista
      setProductos(productos.map(p => 
        p.nombre === selectedProducto.nombre
          ? {
              ...p,
              precio: response.data.precio,
              stock: response.data.stock
            }
          : p
      ))
      
      alert('Producto actualizado exitosamente')
      setIsEditModalOpen(false)
      setSelectedProducto(null)
    } catch (error) {
      console.error('Error al actualizar producto:', error)
      alert(error instanceof Error ? error.message : 'Error al actualizar producto')
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredProductos = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Paginación
  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProductos = filteredProductos.slice(startIndex, endIndex)

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Agrupar por categoría
  const categorias = Array.from(new Set(productos.map(p => p.categoria)))
  const totalProductos = productos.length
  const stockTotal = productos.reduce((sum, p) => sum + parseInt(p.stock), 0)
  const valorInventario = productos.reduce((sum, p) => sum + (parseInt(p.stock) * parseFloat(p.precio)), 0)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
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
        <p className="text-yellow-700 text-sm">Solo los gerentes pueden ver el menú de su local.</p>
      </div>
    )
  }

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
              <p className="text-sm text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900">{totalProductos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Grid3x3 className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Categorías</p>
              <p className="text-2xl font-bold text-gray-900">{categorias.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Package className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Stock Total</p>
              <p className="text-2xl font-bold text-gray-900">{stockTotal}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <DollarSign className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor Inventario</p>
              <p className="text-2xl font-bold text-gray-900">S/. {valorInventario.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar platos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 font-medium"
        >
          <Plus size={20} />
          Nuevo Plato
        </button>
      </div>

      {/* Menu Items Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Plato</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Categoría</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Descripción</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Precio</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Stock</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase w-32">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProductos.length > 0 ? (
              paginatedProductos.map((producto, idx) => (
                <tr key={`${producto.local_id}-${producto.nombre}`} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200 hover:bg-gray-100 transition`}>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{producto.nombre}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                      {producto.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {producto.descripcion}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">S/. {parseFloat(producto.precio).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      parseInt(producto.stock) > 20 
                        ? 'bg-green-100 text-green-700' 
                        : parseInt(producto.stock) > 10 
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {producto.stock} unid.
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 items-center">
                      <button 
                        onClick={() => handleOpenEditModal(producto)}
                        className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                        title="Editar producto"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProducto(producto.nombre)}
                        disabled={deletingNombre === producto.nombre}
                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Eliminar producto"
                      >
                        {deletingNombre === producto.nombre ? (
                          <div className="animate-spin rounded-full h-[18px] w-[18px] border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <Package size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm ? 'No se encontraron productos con ese término' : 'No hay productos disponibles'}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {filteredProductos.length > 0 && (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-6 py-4">
          <div className="text-sm text-gray-600">
            Mostrando <span className="font-semibold text-gray-900">{startIndex + 1}</span> a <span className="font-semibold text-gray-900">{Math.min(endIndex, filteredProductos.length)}</span> de <span className="font-semibold text-gray-900">{filteredProductos.length}</span> productos
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    currentPage === page
                      ? 'bg-red-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Modal de Creación */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Crear Nuevo Producto</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProducto} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="Ej: Arroz Chaufa Especial"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    required
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="Arroces">Arroces</option>
                    <option value="Tallarines">Tallarines</option>
                    <option value="Pollo">Pollo</option>
                    <option value="Carne">Carne</option>
                    <option value="Mariscos">Mariscos</option>
                    <option value="Sopas">Sopas</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Postres">Postres</option>
                    <option value="Entradas">Entradas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio (S/.) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Inicial *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="Ej: 50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="Describe el producto..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                      Crear Producto
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      {isEditModalOpen && selectedProducto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Editar Producto</h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false)
                  setSelectedProducto(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProducto} className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Producto</p>
                <p className="font-bold text-gray-900 text-lg">{selectedProducto.nombre}</p>
                <p className="text-sm text-gray-500">{selectedProducto.categoria}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio (S/.) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={editFormData.precio}
                  onChange={(e) => setEditFormData({ ...editFormData, precio: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Precio actual: S/. {parseFloat(selectedProducto.precio).toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={editFormData.stock}
                  onChange={(e) => setEditFormData({ ...editFormData, stock: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Stock actual: {selectedProducto.stock} unidades
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setSelectedProducto(null)
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
