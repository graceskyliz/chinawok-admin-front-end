# Configuración de WebSocket

## Estado Actual

El sistema de WebSocket está **implementado y listo para usar**. Actualmente se conecta automáticamente cuando:
1. El usuario abre el modal de detalles de un pedido
2. Hay un `usuario_correo` y `pedido_id` válidos

## Cómo Funciona

### Backend (AWS Lambda + API Gateway WebSocket)

Tu backend requiere dos parámetros en la conexión:
- `usuario_correo`: Email del usuario conectado
- `pedido_id`: ID del pedido específico

URL de conexión:
```
wss://tivw1c9evj.execute-api.us-east-1.amazonaws.com/dev?usuario_correo=user@example.com&pedido_id=abc123
```

### Frontend (React Hook)

El hook `useWebSocket` se conecta solo cuando:
- El modal de pedido está abierto (`isModalOpen === true`)
- Hay un pedido seleccionado (`selectedOrder !== null`)
- Hay un usuario autenticado (`user?.email`)

## Variables de Entorno

En tu archivo `.env.local`:

```env
# WebSocket URL (ya configurada)
NEXT_PUBLIC_WS_URL=wss://tivw1c9evj.execute-api.us-east-1.amazonaws.com/dev
```

## Flujo de Notificaciones

1. **Usuario abre modal de pedido**
   ```
   [Frontend] Conectando a WebSocket con pedido_id=abc123
   ```

2. **Backend envía notificación**
   ```python
   enviar_notificacion_pedido(
       pedido_id='abc123',
       usuario_correo='user@example.com',
       tipo_evento='ESTADO_CAMBIADO',
       datos={
           'estado': 'cocinando',
           'mensaje': 'Tu pedido está en preparación'
       }
   )
   ```

3. **Frontend recibe y actualiza UI**
   ```typescript
   // Actualiza el estado del pedido en tiempo real
   // Actualiza el historial de estados
   // Muestra notificación visual
   ```

## Eventos Soportados

| Tipo de Evento | Descripción | Acción Frontend |
|----------------|-------------|-----------------|
| `ESTADO_ACTUALIZADO` | Estado del pedido cambió | Actualiza badge de estado |
| `ESTADO_CAMBIADO` | Igual que anterior | Actualiza badge de estado |
| `PEDIDO_ENTREGADO` | Repartidor marcó como entregado | Muestra botón "Confirmar Recepción" |
| `PEDIDO_COMPLETADO` | Cliente confirmó recepción | Cambia estado a "Recibido" |

## Confirmación de Entrega

Cuando el repartidor marca un pedido como entregado:

1. Backend envía:
   ```json
   {
     "tipo": "PEDIDO_ENTREGADO",
     "pedido_id": "abc123",
     "timestamp": "2025-11-30T10:30:00",
     "datos": {
       "estado": "enviando",
       "mensaje": "El repartidor ha llegado a tu ubicación",
       "accion_requerida": "CONFIRMAR_RECEPCION"
     }
   }
   ```

2. Frontend muestra botón verde "Confirmar Recepción"

3. Usuario hace clic → POST a `/pedidos/confirmar-entrega`

4. Backend envía notificación final:
   ```json
   {
     "tipo": "PEDIDO_COMPLETADO",
     "datos": {
       "estado": "recibido",
       "mensaje": "Pedido completado exitosamente"
     }
   }
   ```

## Debugging

### Ver logs en consola del navegador

```javascript
// Todos los eventos WebSocket se registran automáticamente
[WebSocket] Conectando a: wss://...
[WebSocket] ✅ Conexión establecida
[WebSocket] 📩 Mensaje recibido: {...}
```

### Probar manualmente desde backend

```python
from utils.websocket_utils import enviar_notificacion_pedido

# Enviar notificación de prueba
enviar_notificacion_pedido(
    pedido_id='tu-pedido-id',
    usuario_correo='gerente.local052@chinawok.pe',
    tipo_evento='ESTADO_ACTUALIZADO',
    datos={
        'estado': 'cocinando',
        'mensaje': 'Prueba de notificación en tiempo real',
        'empleado': {
            'nombre_completo': 'Chef Principal',
            'dni': '12345678',
            'rol': 'chef'
        }
    }
)
```

## Solución de Problemas

### ❌ "WebSocket connection failed"

**Causa**: El WebSocket del backend no está respondiendo o la URL es incorrecta.

**Solución**: 
1. Verifica que `NEXT_PUBLIC_WS_URL` esté configurada correctamente
2. Verifica que el API Gateway WebSocket esté desplegado
3. Revisa los logs de Lambda `websocket-connect`

### ⚠️ "Esperando parámetros requeridos"

**Causa**: Intentando conectar sin `usuario_correo` o `pedido_id`.

**Solución**: Esto es normal. El WebSocket solo se conecta cuando se abre el modal de detalles.

### 🔄 "Reconectando..."

**Causa**: La conexión se perdió (internet inestable, backend reiniciado, etc.)

**Solución**: El sistema reintenta automáticamente 3 veces con 5 segundos de intervalo.

## Próximos Pasos

Para implementar en otros componentes (Dashboard, Analytics, etc.):

```typescript
import { useWebSocket } from '@/hooks/use-websocket'

function MiComponente() {
  const { user } = useAuth()
  
  const { isConnected } = useWebSocket({
    usuarioCorreo: user?.email,
    pedidoId: 'id-del-pedido', // Debe ser específico
    onMessage: (notification) => {
      console.log('Nueva notificación:', notification)
      // Actualizar estado local
    }
  })
  
  return (
    <div>
      {isConnected && <span>🟢 Conectado</span>}
    </div>
  )
}
```

## Referencias

- Hook: `hooks/use-websocket.ts`
- Tipos: `lib/types/websocket.ts`
- Componente: `components/pages/Orders.tsx`
- Status UI: `components/ui/websocket-status.tsx`
- Backend: Lambda `websocket-connect.py`, `websocket-disconnect.py`, `websocket_utils.py`
