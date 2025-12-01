'use client'

import { MapPin, Phone, Clock, CheckCircle, Trash2, ChevronLeft, ChevronRight, X, User, Package, Bell } from 'lucide-react'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useLocalId } from '@/hooks/use-local-id'
import { useAuth } from '@/lib/contexts/auth-context'
import { useWebSocket } from '@/hooks/use-websocket'
import { pedidoService, Pedido } from '@/lib/services/pedido-service'
import { WebSocketNotification } from '@/lib/types/websocket'
import { WebSocketStatus } from '@/components/ui/websocket-status'

const ITEMS_PER_PAGE = 10

export default function Orders() {
  const localId = useLocalId()
  const { user } = useAuth()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [orders, setOrders] = useState<Pedido[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Pedido | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [notifications, setNotifications] = useState<WebSocketNotification[]>([])
  const [showConfirmButton, setShowConfirmButton] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((notification: WebSocketNotification) => {
    console.log('[Orders] Notificación recibida:', notification)
    
    // Agregar a lista de notificaciones
    setNotifications(prev => [notification, ...prev].slice(0, 50)) // Keep last 50
    
    // Si es una notificación de pedido entregado que requiere confirmación
    if (notification.tipo === 'PEDIDO_ENTREGADO' && 
        notification.datos.accion_requerida === 'CONFIRMAR_RECEPCION') {
      setShowConfirmButton(true)
    }
    
    // Si hay un pedido seleccionado en el modal, actualizarlo
    if (selectedOrder && selectedOrder.pedido_id === notification.pedido_id) {
      setSelectedOrder(prevOrder => {
        if (!prevOrder) return prevOrder
        
        // Actualizar el estado principal
        const updatedOrder = {
          ...prevOrder,
          estado: notification.datos.estado
        }
        
        // Actualizar historial de estados
        if (prevOrder.historial_estados && prevOrder.historial_estados.length > 0) {
          const newHistorial = [...prevOrder.historial_estados]
          
          // Cerrar el último estado activo
          const lastActiveIndex = newHistorial.findIndex(h => h.activo)
          if (lastActiveIndex !== -1) {
            newHistorial[lastActiveIndex] = {
              ...newHistorial[lastActiveIndex],
              activo: false,
              hora_fin: notification.timestamp
            }
          }
          
          // Agregar nuevo estado
          newHistorial.push({
            estado: notification.datos.estado,
            hora_inicio: notification.timestamp,
            hora_fin: notification.timestamp,
            activo: true,
            empleado: notification.datos.empleado || null
          })
          
          updatedOrder.historial_estados = newHistorial
        }
        
        return updatedOrder
      })
    }
    
    // Actualizar la lista de pedidos
    setOrders(prevOrders => {
      return prevOrders.map(order => {
        if (order.pedido_id === notification.pedido_id) {
          return {
            ...order,
            estado: notification.datos.estado
          }
        }
        return order
      })
    })
  }, [selectedOrder])

  // WebSocket connection - SOLO cuando el modal está abierto y hay un pedido seleccionado
  const { isConnected, reconnectAttempts } = useWebSocket({
    usuarioCorreo: isModalOpen && selectedOrder ? user?.email : undefined,
    pedidoId: isModalOpen && selectedOrder ? selectedOrder.pedido_id : undefined,
    onMessage: handleWebSocketMessage
  })

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

  const handleViewDetails = async (pedidoId: string) => {
    if (!localId) {
      alert('No se pudo obtener el ID del local')
      return
    }

    setIsLoadingDetails(true)
    setIsModalOpen(true)
    
    try {
      const response = await pedidoService.getPedidoById(localId, pedidoId)
      setSelectedOrder(response.data)
    } catch (error) {
      console.error('Error al cargar detalles del pedido:', error)
      alert(error instanceof Error ? error.message : 'Error al cargar detalles del pedido')
      setIsModalOpen(false)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedOrder(null)
    setShowConfirmButton(false)
  }

  const handleConfirmDelivery = async () => {
    if (!selectedOrder || !localId) {
      alert('No se pudo confirmar la entrega')
      return
    }

    setIsConfirming(true)
    try {
      await pedidoService.confirmOrderDelivery(
        localId, 
        selectedOrder.pedido_id,
        selectedOrder.task_token
      )
      
      setShowConfirmButton(false)
      alert('Entrega confirmada exitosamente')
      
      // Actualizar el pedido localmente
      setSelectedOrder(prev => prev ? { ...prev, estado: 'recibido' } : null)
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.pedido_id === selectedOrder.pedido_id 
            ? { ...order, estado: 'recibido' } 
            : order
        )
      )
    } catch (error) {
      console.error('Error al confirmar entrega:', error)
      alert(error instanceof Error ? error.message : 'Error al confirmar entrega')
    } finally {
      setIsConfirming(false)
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
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleViewDetails(order.pedido_id)}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
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

      {/* Modal de Detalles */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900">Detalles del Pedido</h2>
                <WebSocketStatus isConnected={isConnected} reconnectAttempts={reconnectAttempts} />
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            
            {isLoadingDetails ? (
              <div className="p-12 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              </div>
            ) : selectedOrder ? (
              <div className="p-6 space-y-6">
                {/* Order Header */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">ID del Pedido</p>
                      <p className="font-mono text-sm text-gray-900">{selectedOrder.pedido_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estado</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedOrder.estado)}`}>
                        {getStatusLabel(selectedOrder.estado)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-red-600">S/. {selectedOrder.costo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Entrega Aprox.</p>
                      <p className="text-sm text-gray-900">{new Date(selectedOrder.fecha_entrega_aproximada).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <User size={20} className="text-blue-600" />
                    Información del Cliente
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Correo:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedOrder.usuario_correo}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-gray-600 mt-1" />
                      <span className="text-sm text-gray-900">{selectedOrder.direccion}</span>
                    </div>
                  </div>
                </div>

                {/* Products */}
                {selectedOrder.productos && selectedOrder.productos.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Package size={20} className="text-orange-600" />
                      Productos ({selectedOrder.productos.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedOrder.productos.map((producto, idx) => (
                        <div key={idx} className="bg-orange-50 rounded-lg p-3 flex items-center justify-between">
                          <span className="font-medium text-gray-900">{producto.nombre}</span>
                          <span className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-sm font-semibold">
                            x{producto.cantidad}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Combos */}
                {selectedOrder.combos && selectedOrder.combos.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Package size={20} className="text-purple-600" />
                      Combos ({selectedOrder.combos.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedOrder.combos.map((combo, idx) => (
                        <div key={idx} className="bg-purple-50 rounded-lg p-3 flex items-center justify-between">
                          <span className="font-medium text-gray-900">Combo ID: {combo.combo_id}</span>
                          <span className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm font-semibold">
                            x{combo.cantidad}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Order History */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock size={20} className="text-green-600" />
                    Historial de Estados
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.historial_estados.map((historial, idx) => (
                      <div key={idx} className={`rounded-lg p-4 border-l-4 ${historial.activo ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-semibold ${historial.activo ? 'text-green-700' : 'text-gray-700'}`}>
                            {getStatusLabel(historial.estado)}
                          </span>
                          {historial.activo && (
                            <span className="px-2 py-1 bg-green-200 text-green-800 text-xs font-semibold rounded-full">
                              ACTIVO
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>Inicio: {new Date(historial.hora_inicio).toLocaleString()}</p>
                          <p>Fin: {new Date(historial.hora_fin).toLocaleString()}</p>
                          {historial.empleado && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="font-medium text-gray-700">Empleado: {historial.empleado.nombre_completo}</p>
                              <p>DNI: {historial.empleado.dni} • Rol: {historial.empleado.rol}</p>
                              {historial.empleado.calificacion_prom && (
                                <p>Calificación: ⭐ {parseFloat(historial.empleado.calificacion_prom).toFixed(2)}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notifications Section */}
                {notifications.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Bell size={20} className="text-purple-600" />
                      Notificaciones en Tiempo Real ({notifications.length})
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {notifications.slice(0, 5).map((notification, idx) => (
                        <div key={idx} className="bg-purple-50 rounded-lg p-3 border-l-4 border-purple-500">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-purple-800">{notification.tipo}</span>
                            <span className="text-xs text-gray-600">{new Date(notification.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-sm text-gray-900">{notification.datos.mensaje}</p>
                          <p className="text-xs text-gray-600 mt-1">Estado: {notification.datos.estado}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confirm Delivery Button */}
                {showConfirmButton && selectedOrder.esperando_confirmacion && (
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-green-900 mb-1">Pedido Entregado</h3>
                        <p className="text-sm text-green-700">El repartidor ha marcado este pedido como entregado. Por favor, confirma la recepción.</p>
                      </div>
                      <button
                        onClick={handleConfirmDelivery}
                        disabled={isConfirming}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isConfirming ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Confirmando...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={20} />
                            Confirmar Recepción
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                No se pudieron cargar los detalles
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
