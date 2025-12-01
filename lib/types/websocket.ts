// WebSocket Types
export interface NotificationData {
  estado: string
  mensaje: string
  accion_requerida?: 'CONFIRMAR_RECEPCION'
  empleado?: {
    nombre_completo: string
    dni: string
    rol: string
  }
  hora_cambio?: string
}

export interface WebSocketNotification {
  tipo: 'ESTADO_ACTUALIZADO' | 'ESTADO_CAMBIADO' | 'PEDIDO_ENTREGADO' | 'PEDIDO_COMPLETADO'
  pedido_id: string
  timestamp: string
  datos: NotificationData
}

export interface WebSocketConfig {
  usuarioCorreo?: string
  pedidoId?: string
  localId?: string
  onMessage?: (notification: WebSocketNotification) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
}
