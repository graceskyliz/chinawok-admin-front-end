import { Wifi, WifiOff } from 'lucide-react'

interface WebSocketStatusProps {
  isConnected: boolean
  reconnectAttempts?: number
  className?: string
}

export function WebSocketStatus({ isConnected, reconnectAttempts = 0, className = '' }: WebSocketStatusProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isConnected ? (
        <>
          <Wifi size={16} className="text-green-600" />
          <span className="text-xs text-green-600 font-medium">Conectado en tiempo real</span>
        </>
      ) : (
        <>
          <WifiOff size={16} className="text-orange-600" />
          <span className="text-xs text-orange-600 font-medium">
            {reconnectAttempts > 0 ? `Reconectando... (${reconnectAttempts})` : 'Desconectado'}
          </span>
        </>
      )}
    </div>
  )
}
