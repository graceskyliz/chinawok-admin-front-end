# Sistema de Notificaciones WebSocket en Tiempo Real

## Descripción General

Este sistema permite recibir actualizaciones en tiempo real sobre el estado de los pedidos mediante WebSocket. Los clientes se conectan al servidor WebSocket y reciben notificaciones automáticas cuando el estado de un pedido cambia.

## Arquitectura

```
┌─────────────┐         WebSocket         ┌─────────────────┐
│   Frontend  │ ◄──────────────────────► │  API Gateway    │
│  (Orders)   │    Notificaciones         │   WebSocket     │
└─────────────┘                           └─────────────────┘
                                                    │
                                                    ▼
                                           ┌─────────────────┐
                                           │  Step Functions │
                                           │   (Workflow)    │
                                           └─────────────────┘
```

## Componentes Principales

### 1. Hook `useWebSocket` (`hooks/use-websocket.ts`)

Hook personalizado que maneja la conexión WebSocket con las siguientes características:

- **Reconexión automática**: Si la conexión se pierde, intenta reconectar cada 3 segundos (hasta 10 intentos)
- **Gestión de estado**: Expone `isConnected`, `lastNotification`, `error`, `reconnectAttempts`
- **Limpieza automática**: Cierra la conexión cuando el componente se desmonta
- **Envío de mensajes**: Método `sendMessage()` para comunicación bidireccional

#### Uso:

```typescript
import { useWebSocket } from '@/hooks/use-websocket'

const { isConnected, lastNotification, reconnect } = useWebSocket({
  usuarioCorreo: user?.email,
  localId: localId,
  pedidoId: selectedOrder?.pedido_id,
  onMessage: (notification) => {
    console.log('Notificación recibida:', notification)
  }
})
```

### 2. Tipos de WebSocket (`lib/types/websocket.ts`)

Define las interfaces TypeScript para las notificaciones:

```typescript
interface WebSocketNotification {
  tipo: 'ESTADO_ACTUALIZADO' | 'ESTADO_CAMBIADO' | 'PEDIDO_ENTREGADO' | 'PEDIDO_COMPLETADO'
  pedido_id: string
  timestamp: string
  datos: NotificationData
}

interface NotificationData {
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
```

### 3. Componente `Orders` (`components/pages/Orders.tsx`)

Implementa el sistema de notificaciones en tiempo real:

#### A. Conexión WebSocket

```typescript
// WebSocket message handler
const handleWebSocketMessage = useCallback((notification: WebSocketNotification) => {
  // 1. Agregar a lista de notificaciones
  setNotifications(prev => [notification, ...prev].slice(0, 50))
  
  // 2. Detectar si requiere confirmación
  if (notification.tipo === 'PEDIDO_ENTREGADO' && 
      notification.datos.accion_requerida === 'CONFIRMAR_RECEPCION') {
    setShowConfirmButton(true)
  }
  
  // 3. Actualizar estado del pedido en el modal
  if (selectedOrder && selectedOrder.pedido_id === notification.pedido_id) {
    // Actualizar estado y historial
  }
  
  // 4. Actualizar lista general de pedidos
  setOrders(prevOrders => {
    return prevOrders.map(order => {
      if (order.pedido_id === notification.pedido_id) {
        return { ...order, estado: notification.datos.estado }
      }
      return order
    })
  })
}, [selectedOrder])

// Conectar
const { isConnected, reconnectAttempts } = useWebSocket({
  usuarioCorreo: user?.email,
  localId: localId || undefined,
  pedidoId: selectedOrder?.pedido_id,
  onMessage: handleWebSocketMessage
})
```

#### B. Actualización del Historial de Estados

Cuando llega una notificación:

1. **Cerrar el último estado activo**: Buscar el estado con `activo: true` y poner `hora_fin` con el timestamp de la notificación
2. **Crear nuevo estado**: Agregar una entrada al historial con el nuevo estado
3. **Re-renderizar**: React actualiza automáticamente la UI

```typescript
// Actualizar historial de estados
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
```

### 4. Servicio de Pedidos (`lib/services/pedido-service.ts`)

Método para confirmar la entrega:

```typescript
async confirmOrderDelivery(
  localId: string, 
  pedidoId: string, 
  taskToken?: string
): Promise<PedidoResponse> {
  const payload = {
    local_id: localId,
    pedido_id: pedidoId,
    estado: 'recibido',
    ...(taskToken && { task_token: taskToken })
  }
  
  return await this.fetchWithAuth(
    `${this.baseUrl}/pedidos/confirmar-entrega`, 
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  )
}
```

### 5. Componente de Estado (`components/ui/websocket-status.tsx`)

Indicador visual del estado de conexión:

```typescript
<WebSocketStatus 
  isConnected={isConnected} 
  reconnectAttempts={reconnectAttempts} 
/>
```

## Flujo de Trabajo

### 1. Carga Inicial (REST API)

Al abrir el modal de detalles:

```
Usuario → Ver Detalles → GET /pedidos?local_id=X&pedido_id=Y → Estado Inicial
```

Si `esperando_confirmacion: true`, mostrar el botón de confirmación.

### 2. Actualizaciones en Tiempo Real (WebSocket)

```
Step Functions → Cambio de Estado → WebSocket Message → Frontend Update
```

Eventos posibles:
- `ESTADO_ACTUALIZADO`: Estado cambió (procesando → cocinando)
- `ESTADO_CAMBIADO`: Similar a ESTADO_ACTUALIZADO
- `PEDIDO_ENTREGADO`: Repartidor marcó como entregado (requiere confirmación)
- `PEDIDO_COMPLETADO`: Cliente confirmó recepción

### 3. Confirmación de Entrega

```
1. Repartidor marca como "Entregado"
   ↓
2. Backend envía: { tipo: 'PEDIDO_ENTREGADO', accion_requerida: 'CONFIRMAR_RECEPCION' }
   ↓
3. Frontend muestra botón "Confirmar Recepción"
   ↓
4. Usuario hace clic
   ↓
5. POST /pedidos/confirmar-entrega con task_token
   ↓
6. Backend envía: { tipo: 'PEDIDO_COMPLETADO', estado: 'recibido' }
   ↓
7. Frontend oculta botón y muestra estado "Recibido"
```

## Configuración

### Variables de Entorno

Crear archivo `.env.local`:

```env
# WebSocket URL (debe ser wss:// en producción)
NEXT_PUBLIC_WS_URL=wss://your-api-gateway-websocket-url.com/ws

# APIs REST
NEXT_PUBLIC_API_PEDIDOS_URL=https://your-api.com/pedidos
NEXT_PUBLIC_API_LOCALES_URL=https://your-api.com/locales
NEXT_PUBLIC_API_USUARIOS_URL=https://your-api.com/usuarios
NEXT_PUBLIC_API_EMPLEADOS_URL=https://your-api.com/empleados
```

### Parámetros de Conexión WebSocket

El hook construye la URL con parámetros de query:

```
wss://your-api.com/ws?usuario_correo=user@example.com&local_id=abc123&pedido_id=xyz789
```

- `usuario_correo`: Email del usuario autenticado
- `local_id`: ID del local (para recibir todos los pedidos del local)
- `pedido_id`: ID específico del pedido (para filtrar notificaciones)

## Características Avanzadas

### Reconexión Automática

Si la conexión se pierde:
1. Muestra "Desconectado" en el indicador
2. Intenta reconectar cada 3 segundos
3. Máximo 10 intentos
4. Después de 10 intentos, muestra error

### Gestión de Notificaciones

- Almacena últimas 50 notificaciones en memoria
- Muestra las 5 más recientes en el modal
- Cada notificación incluye timestamp y mensaje

### Estados del Pedido

- `procesando`: Pedido recibido, pendiente de preparación
- `cocinando`: En preparación
- `empacando`: Listo para envío
- `enviando`: En camino con repartidor
- `recibido`: Entregado y confirmado
- `cancelado`: Pedido cancelado

## Mejores Prácticas

### 1. Manejo de Errores

```typescript
const { error } = useWebSocket({ ... })

if (error) {
  // Mostrar mensaje al usuario
  console.error('Error WebSocket:', error)
}
```

### 2. Limpieza de Recursos

El hook limpia automáticamente la conexión cuando el componente se desmonta:

```typescript
useEffect(() => {
  // Conectar
  connect()
  
  // Limpieza automática
  return () => disconnect()
}, [connect, disconnect])
```

### 3. Validación de Datos

Siempre validar los datos recibidos:

```typescript
const handleWebSocketMessage = (notification: WebSocketNotification) => {
  if (!notification.pedido_id || !notification.datos) {
    console.error('Notificación inválida:', notification)
    return
  }
  
  // Procesar notificación
}
```

### 4. Testing

Para probar sin backend:

```typescript
// En useWebSocket.ts, agregar modo de desarrollo
const WS_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'ws://localhost:3001/ws'  // Local mock
  : process.env.NEXT_PUBLIC_WS_URL
```

## Troubleshooting

### Problema: No se conecta

1. Verificar `NEXT_PUBLIC_WS_URL` en `.env.local`
2. Verificar que el usuario esté autenticado (`user?.email`)
3. Verificar logs del navegador (Consola → Network → WS)

### Problema: Se desconecta frecuentemente

1. Verificar la estabilidad de la conexión a internet
2. Aumentar `MAX_RECONNECT_ATTEMPTS` si es necesario
3. Verificar timeout del API Gateway

### Problema: No llegan notificaciones

1. Verificar que `pedido_id` sea correcto
2. Verificar que el backend esté enviando mensajes al WebSocket
3. Verificar formato del mensaje (debe ser JSON válido)

## Ejemplo Completo

```typescript
// En cualquier componente
import { useWebSocket } from '@/hooks/use-websocket'
import { useAuth } from '@/lib/contexts/auth-context'

function MyComponent() {
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  
  const { isConnected, lastNotification } = useWebSocket({
    usuarioCorreo: user?.email,
    pedidoId: order?.pedido_id,
    onMessage: (notification) => {
      console.log('Nueva notificación:', notification)
      
      // Actualizar estado del pedido
      setOrder(prev => ({
        ...prev,
        estado: notification.datos.estado
      }))
    }
  })
  
  return (
    <div>
      {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
      {lastNotification && (
        <p>Última actualización: {lastNotification.datos.mensaje}</p>
      )}
    </div>
  )
}
```

## Referencias

- [WebSocket API MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [AWS API Gateway WebSocket](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api.html)
- [React useEffect Hook](https://react.dev/reference/react/useEffect)
- [TypeScript Interfaces](https://www.typescriptlang.org/docs/handbook/interfaces.html)
