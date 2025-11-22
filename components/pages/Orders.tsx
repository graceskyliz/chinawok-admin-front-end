'use client'

import { MapPin, Phone, Clock, CheckCircle, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useLocalId } from '@/hooks/use-local-id'
import { pedidoService } from '@/lib/services/pedido-service'

export default function Orders() {
  const localId = useLocalId()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [orders, setOrders] = useState([
    {
      id: '#1001',
      pedido_id: 'adc895bb-278a-45a7-a054-82cefb0f18e7',
      customer: 'Juan García',
      phone: '987654321',
      address: 'Miraflores, Lima',
      items: 'Arroz Chaufa + Tallarín Saltado',
      total: 'S/. 35.80',
      status: 'En Camino',
      time: '2 min'
    },
    {
      id: '#1002',
      pedido_id: 'bef2a3cc-489b-56b8-b165-93dcb1f29fa8',
      customer: 'María López',
      phone: '912345678',
      address: 'San Isidro, Lima',
      items: 'Combo Personal x2',
      total: 'S/. 49.80',
      status: 'Preparando',
      time: '8 min'
    },
    {
      id: '#1003',
      pedido_id: 'c1f3b4dd-57ac-67c9-c276-a4edc2g3ahb9',
      customer: 'Carlos Mendez',
      phone: '956789012',
      address: 'Puruchuco, Lima',
      items: 'Banquetazo Especial',
      total: 'S/. 89.90',
      status: 'Entregado',
      time: '15 min'
    }
  ])

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
    switch (status) {
      case 'En Camino':
        return 'bg-blue-100 text-blue-700'
      case 'Preparando':
        return 'bg-orange-100 text-orange-700'
      case 'Entregado':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Order Info */}
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Pedido</p>
              <p className="text-xl font-bold text-gray-900 mb-4">{order.id}</p>
              <p className="text-sm font-medium text-gray-900 mb-1">{order.customer}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Phone size={16} />
                {order.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={16} />
                {order.address}
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="text-xs text-gray-500 uppercase mb-2">Ítems</p>
              <p className="text-sm font-medium text-gray-900">{order.items}</p>
            </div>

            {/* Total & Time */}
            <div>
              <p className="text-xs text-gray-500 uppercase mb-2">Total</p>
              <p className="text-2xl font-bold text-red-600 mb-4">{order.total}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} />
                <span>{order.time}</span>
              </div>
            </div>

            {/* Status & Actions */}
            <div className="flex flex-col items-end justify-between">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                {order.status}
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
      ))}
    </div>
  )
}
