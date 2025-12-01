import { useEffect, useRef, useState, useCallback } from 'react'
import { WebSocketNotification, WebSocketConfig } from '@/lib/types/websocket'

const RAW_WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL?.trim()
const WS_BASE_URL = RAW_WS_BASE_URL && /^wss?:\/\//i.test(RAW_WS_BASE_URL) ? RAW_WS_BASE_URL : null
const RECONNECT_DELAY = 3000 // 3 seconds
const MAX_RECONNECT_ATTEMPTS = 10

const READY_STATE_LABELS: Record<number, string> = {
  0: 'conectando',
  1: 'abierta',
  2: 'cerrando',
  3: 'cerrada'
}

const describeReadyState = (ws?: WebSocket | null) => {
  if (!ws) return 'desconocido'
  const label = READY_STATE_LABELS[ws.readyState] || 'desconocido'
  return `${label} (${ws.readyState})`
}

const describeWebSocketError = (event: Event, ws?: WebSocket | null) => {
  if (event instanceof ErrorEvent) {
    return event.message || event.error?.message || 'ErrorEvent sin detalles adicionales'
  }

  const maybeMessage = (event as { message?: string }).message
  if (maybeMessage) {
    return maybeMessage
  }

  return `Evento "${event.type}" sin detalles adicionales. Estado WS: ${describeReadyState(ws)}`
}

export const useWebSocket = (config: WebSocketConfig) => {
  const { usuarioCorreo, pedidoId, localId, onMessage, onConnect, onDisconnect, onError } = config
  
  const [isConnected, setIsConnected] = useState(false)
  const [lastNotification, setLastNotification] = useState<WebSocketNotification | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const shouldReconnectRef = useRef(true)

  const buildWebSocketUrl = useCallback(() => {
    if (!WS_BASE_URL) {
      return null
    }

    const params = new URLSearchParams()
    
    if (usuarioCorreo) params.append('usuario_correo', usuarioCorreo)
    if (pedidoId) params.append('pedido_id', pedidoId)
    if (localId) params.append('local_id', localId)
    
    const queryString = params.toString()
    return queryString ? `${WS_BASE_URL}?${queryString}` : WS_BASE_URL
  }, [usuarioCorreo, pedidoId, localId])

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    setIsConnected(false)
  }, [])

  const connect = useCallback(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (!WS_BASE_URL) {
      const message = 'La URL de WebSocket no está configurada. Define NEXT_PUBLIC_WS_URL.'
      console.warn('[WebSocket] Configuración faltante:', message)
      setError(message)
      setIsConnected(false)
      return
    }

    // Don't connect if we're already connected
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    // Don't reconnect if we've exceeded max attempts
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      setError(`No se pudo conectar después de ${MAX_RECONNECT_ATTEMPTS} intentos`)
      return
    }

    try {
      const wsUrl = buildWebSocketUrl()
      if (!wsUrl) {
        return
      }
      console.log('[WebSocket] Conectando a:', wsUrl)
      
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        console.log('[WebSocket] Conexión establecida')
        setIsConnected(true)
        setError(null)
        setReconnectAttempts(0)
        
        if (onConnect) onConnect()
      }
      
      ws.onmessage = (event: MessageEvent) => {
        try {
          const notification: WebSocketNotification = JSON.parse(event.data)
          console.log('[WebSocket] Mensaje recibido:', notification)
          
          setLastNotification(notification)
          
          if (onMessage) {
            onMessage(notification)
          }
        } catch (err) {
          console.error('[WebSocket] Error al parsear mensaje:', err)
          setError('Error al procesar notificación')
        }
      }
      
      ws.onerror = (event: Event) => {
        const details = describeWebSocketError(event, ws)
        console.error('[WebSocket] Error de conexión:', details)
        setError(details)
        
        if (onError) onError(event)
      }
      
      ws.onclose = (event: CloseEvent) => {
        console.log('[WebSocket] Conexión cerrada:', event.code, event.reason)
        setIsConnected(false)
        wsRef.current = null
        
        if (onDisconnect) onDisconnect()
        
        // Intentar reconectar automáticamente si no fue un cierre intencional
        if (shouldReconnectRef.current && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          console.log(`[WebSocket] Intentando reconectar en ${RECONNECT_DELAY}ms... (Intento ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1)
            connect()
          }, RECONNECT_DELAY)
        }
      }
      
      wsRef.current = ws
    } catch (err) {
      console.error('[WebSocket] Error al crear conexión:', err)
      setError('No se pudo establecer la conexión')
    }
  }, [buildWebSocketUrl, onMessage, onConnect, onDisconnect, onError, reconnectAttempts])

  const reconnect = useCallback(() => {
    disconnect()
    setReconnectAttempts(0)
    shouldReconnectRef.current = true
    connect()
  }, [connect, disconnect])

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
      return true
    }
    console.warn('[WebSocket] No se puede enviar mensaje: conexión no establecida')
    return false
  }, [])

  useEffect(() => {
    shouldReconnectRef.current = true
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    isConnected,
    lastNotification,
    error,
    reconnectAttempts,
    reconnect,
    disconnect,
    sendMessage
  }
}
