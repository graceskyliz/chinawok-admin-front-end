'use client'

import { MapPin, Phone, Clock, CheckCircle, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { useLocalId } from '@/hooks/use-local-id'
import { pedidoService, Pedido } from '@/lib/services/pedido-service'

const ITEMS_PER_PAGE = 10

export default function Orders() {
  const localId = useLocalId()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [orders, setOrders] = useState<Pedido[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchPedidos = async () => {
      if (!localId) {
        setIsLoading(false)
        return
      }

      try {
        const response = await pedidoService.getPedidosByLocal(localId)
        setOrders(response.data)
      } catch (err) {
        console.error('Error fetching pedidos:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar pedidos')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPedidos()
  }, [localId])

  // Pagination logic
  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE)
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return orders.slice(startIndex, endIndex)
  }, [orders, currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeletePedido = async (pedidoId: string) => {
    if (!localId) {
      alert('No se pudo obtener el ID del local')
      return
    }

    if (!confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
      return
    }

    setDeletingId(pedidoId)
    try {
      await pedidoService.deletePedido(localId, pedidoId)
      setOrders(orders.filter(order => order.pedido_id !== pedidoId))
      alert('Pedido eliminado exitosamente')
    } catch (error) {
      console.error('Error al eliminar pedido:', error)
      alert(error instanceof Error ? error.message : 'Error al eliminar pedido')
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'procesando': 'bg-yellow-100 text-yellow-700',
      'cocinando': 'bg-orange-100 text-orange-700',
      'empacando': 'bg-blue-100 text-blue-700',
      'enviando': 'bg-indigo-100 text-indigo-700',
      'recibido': 'bg-green-100 text-green-700',
      'cancelado': 'bg-red-100 text-red-700'
    }
    return statusMap[status.toLowerCase()] || 'bg-gray-100 text-gray-700'
  }

  const getStatusLabel = (status: string) => {
    const labelMap: Record<string, string> = {
      'procesando': 'Procesando',
      'cocinando': 'Cocinando',
      'empacando': 'Empacando',
      'enviando': 'En Camino',
      'recibido': 'Entregado',
      'cancelado': 'Cancelado'
    }
    return labelMap[status.toLowerCase()] || status
  }

  const formatItems = (order: Pedido) => {
    const items: string[] = []
    
    if (order.productos && order.productos.length > 0) {
      items.push(...order.productos.map(p => `${p.nombre} (${p.cantidad})`))
    }
    
    if (order.combos && order.combos.length > 0) {
      items.push(...order.combos.map(c => `Combo (${c.cantidad})`))
    }
    
    return items.join(', ') || 'Sin productos'
  }

  const calculateTimeElapsed = (fechaEntrega: string) => {
    const now = new Date()
    const deliveryDate = new Date(fechaEntrega)
    const diffMs = deliveryDate.getTime() - now.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 0) return 'Retrasado'
    if (diffMins < 60) return `${diffMins} min`
    return `${Math.floor(diffMins / 60)}h ${diffMins % 60}min`
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        ))}
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

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No hay pedidos disponibles</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Orders List */}
      <div className="space-y-4">
        {paginatedOrders.map((order, index) => {
          const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index
          return (
            <div key={order.pedido_id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Order Info */}
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Pedido</p>
                  <p className="text-xl font-bold text-gray-900 mb-4">#{globalIndex + 1}</p>
                  <p className="text-sm font-medium text-gray-900 mb-1">{order.usuario_correo}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} />
                    {order.direccion}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-2">Ítems</p>
                  <p className="text-sm font-medium text-gray-900">{formatItems(order)}</p>
                </div>

                {/* Total & Time */}
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-2">Total</p>
                  <p className="text-2xl font-bold text-red-600 mb-4">S/. {order.costo}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>{calculateTimeElapsed(order.fecha_entrega_aproximada)}</span>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col items-end justify-between">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.estado)}`}>
                    {getStatusLabel(order.estado)}
                  </span>
                  <div className="flex gap-2 mt-2">
                    <button className="text-sm font-medium text-red-600 hover:text-red-700">
                      Ver Detalles →
                    </button>
                    <button
                      onClick={() => handleDeletePedido(order.pedido_id)}
                      disabled={deletingId === order.pedido_id}
                      className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Eliminar pedido"
                    >
                      {deletingId === order.pedido_id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-6 py-4">
          <div className="text-sm text-gray-600">
            Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, orders.length)} de {orders.length} pedidos
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition ${
                        currentPage === page
                          ? 'bg-red-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  )
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2 py-2 text-gray-400">...</span>
                }
                return null
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
