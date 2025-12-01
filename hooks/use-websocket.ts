import { useEffect, useRef, useState, useCallback } from 'react'
import { WebSocketNotification, WebSocketConfig } from '@/lib/types/websocket'

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || ''
const RECONNECT_DELAY = 5000 // 5 seconds
const MAX_RECONNECT_ATTEMPTS = 3

export const useWebSocket = (config: WebSocketConfig) => {
  const { usuarioCorreo, pedidoId, onMessage, onConnect, onDisconnect, onError } = config
  
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
    
    const queryString = params.toString()
    return queryString ? `${WS_BASE_URL}?${queryString}` : null
  }, [usuarioCorreo, pedidoId])

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
    // Don't connect if required params are missing
    if (!usuarioCorreo || !pedidoId) {
      console.info('[WebSocket] Esperando parámetros requeridos (usuario_correo y pedido_id)')
      return
    }

    // Don't connect if we don't have a WebSocket URL
    if (!WS_BASE_URL) {
      console.info('[WebSocket] NEXT_PUBLIC_WS_URL no configurada')
      return
    }

    // Don't connect if we're already connected
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    // Don't reconnect if we've exceeded max attempts
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.warn(`[WebSocket] Máximo de intentos alcanzado (${MAX_RECONNECT_ATTEMPTS})`)
      setError(`WebSocket no disponible`)
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
        console.log('[WebSocket] ✅ Conexión establecida')
        setIsConnected(true)
        setError(null)
        setReconnectAttempts(0)
        
        if (onConnect) onConnect()
      }
      
      ws.onmessage = (event: MessageEvent) => {
        try {
          const notification: WebSocketNotification = JSON.parse(event.data)
          console.log('[WebSocket] 📩 Mensaje recibido:', notification)
          
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
        console.warn('[WebSocket] ⚠️  Error de conexión')
        // Don't set error state to avoid UI disruption
        if (onError) onError(event)
      }
      
      ws.onclose = (event: CloseEvent) => {
        console.log('[WebSocket] Conexión cerrada:', event.code)
        setIsConnected(false)
        wsRef.current = null
        
        if (onDisconnect) onDisconnect()
        
        // Only reconnect if it wasn't a normal closure and we haven't exceeded attempts
        if (shouldReconnectRef.current && event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          console.log(`[WebSocket] Reconectando en ${RECONNECT_DELAY}ms... (${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1)
            connect()
          }, RECONNECT_DELAY)
        } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          console.warn('[WebSocket] Máximo de reconexiones alcanzado')
          setError('WebSocket no disponible')
        }
      }
      
      wsRef.current = ws
    } catch (err) {
      console.error('[WebSocket] Error al crear conexión:', err)
      setError('No se pudo establecer la conexión')
    }
  }, [buildWebSocketUrl, onMessage, onConnect, onDisconnect, onError, reconnectAttempts, usuarioCorreo, pedidoId])

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
