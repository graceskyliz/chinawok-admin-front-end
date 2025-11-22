'use client'

import { Plus, Edit, Trash2, Search, Package, DollarSign, Grid3x3, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useLocalId } from '@/hooks/use-local-id'
import { productoService, Producto } from '@/lib/services/producto-service'

export default function MenuManagement() {
  const localId = useLocalId()
  const [searchTerm, setSearchTerm] = useState('')
  const [productos, setProductos] = useState<Producto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [deletingNombre, setDeletingNombre] = useState<string | null>(null)

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
        <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 font-medium">
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
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Acciones</th>
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
                  <td className="px-6 py-4 flex gap-2">
                    <button className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition">
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteProducto(producto.nombre)}
                      disabled={deletingNombre === producto.nombre}
                      className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingNombre === producto.nombre ? (
                        <div className="animate-spin rounded-full h-[18px] w-[18px] border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
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
    </div>
  )
}
