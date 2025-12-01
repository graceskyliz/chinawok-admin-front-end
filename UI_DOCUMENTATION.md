# Documentación de UI - ChinaWok Admin Dashboard

## Descripción General

Panel de administración para restaurantes ChinaWok que permite gestionar pedidos, inventario, personal, ofertas y analíticas en tiempo real. Sistema multi-local con roles de **Admin** y **Gerente**.

---

## 📊 Dashboard (Pantalla Principal)

**Ruta:** `/`  
**Componente:** `components/pages/Dashboard.tsx`

### Funcionalidad
Panel de control principal que muestra métricas clave del restaurante en tiempo real.

### Contenido
- **4 KPIs Principales:**
  - 💰 **Revenue Total:** Ingresos totales del local con indicador de cambio porcentual
  - 📦 **Total de Pedidos:** Cantidad de pedidos con tasa de completados
  - 👥 **Clientes Únicos:** Número de clientes diferentes
  - 📈 **Ticket Promedio:** Valor promedio por pedido con rango (mínimo/máximo)

- **8 Tarjetas de Métricas Adicionales:**
  - 🏪 **Inventario:** Total de productos, stock bajo, sin stock
  - 👨‍🍳 **Personal:** Total empleados, cocineros, repartidores, promedio calificación
  - 🎁 **Ofertas:** Ofertas activas, descuento promedio
  - 🍱 **Combos:** Total combos, disponibles
  - ⭐ **Reseñas:** Total reseñas, calificación promedio, excelentes vs malas
  - 📊 **Estados de Pedidos:** Contadores por estado (cocinando, empacando, enviando)

### Datos Mostrados
- Revenue en soles (S/.)
- Porcentajes de cambio con indicadores de tendencia (↑ positivo en verde, ↓ negativo en rojo)
- Calificaciones con estrellas (⭐)
- Estados codificados por color

### Acciones
- Vista en tiempo real (sin refresh manual)
- Actualización automática al cargar la página

---

## 📦 Gestión de Pedidos

**Ruta:** Accesible desde menú lateral  
**Componente:** `components/pages/Orders.tsx`

### Funcionalidad
Visualización y gestión de todos los pedidos del local con actualizaciones en tiempo real vía WebSocket.

### Contenido

#### Lista Principal de Pedidos
Cada pedido muestra:
- 🔢 **Número de Pedido:** Índice secuencial (#1, #2, #3...)
- 👤 **Cliente:** Email del usuario
- 📍 **Dirección:** Dirección de entrega
- 🍜 **Ítems:** Lista de productos y combos incluidos
- 💰 **Total:** Costo total en S/.
- ⏱️ **Tiempo Estimado:** Countdown o indicador de retraso
- 🗑️ **Eliminar:** Botón para eliminar pedido (con confirmación)
- 👁️ **Ver Detalles:** Abre modal con información completa

#### Modal de Detalles de Pedido
- **Indicador de WebSocket:** Muestra si está conectado en tiempo real
- **Información del Pedido:**
  - ID del pedido (formato UUID)
  - Estado actual (con badge de color)
  - Total del pedido
  - Fecha de entrega aproximada
- **Datos del Cliente:**
  - Email
  - Dirección completa
- **Productos Pedidos:**
  - Lista con nombre y cantidad
  - Agrupados por tipo (productos, combos)
- **Historial de Estados:**
  - Timeline completo del pedido
  - Hora de inicio y fin de cada estado
  - Empleado responsable de cada cambio (con foto, nombre, DNI, rol, calificación)
  - Estado activo destacado en verde
- **Notificaciones en Tiempo Real:**
  - Últimas 5 notificaciones del WebSocket
  - Timestamp y mensaje de cada evento
- **Botón de Confirmación de Entrega:**
  - Aparece cuando el pedido está marcado como "Entregado" por el repartidor
  - Permite al cliente confirmar la recepción
  - Cierra el ciclo del pedido

### Datos Mostrados
- Estados: `procesando`, `cocinando`, `empacando`, `enviando`, `recibido`, `cancelado`
- Colores por estado:
  - 🟡 Procesando (amarillo)
  - 🟠 Cocinando (naranja)
  - 🔵 Empacando (azul)
  - 🟣 Enviando (índigo)
  - 🟢 Recibido (verde)
  - 🔴 Cancelado (rojo)

### Acciones
- ✅ **Ver Detalles:** Abre modal con información completa + WebSocket en tiempo real
- 🗑️ **Eliminar Pedido:** Requiere confirmación
- 📄 **Paginación:** 10 pedidos por página
- ✔️ **Confirmar Entrega:** Solo cuando el repartidor marca como entregado

### Actualizaciones en Tiempo Real
- Se conecta vía WebSocket al abrir el modal de un pedido
- Recibe notificaciones de cambios de estado automáticamente
- Actualiza el historial y el badge de estado sin recargar
- Se desconecta limpiamente al cerrar el modal

---

## 🍜 Gestión de Menú

**Ruta:** Accesible desde menú lateral  
**Componente:** `components/pages/MenuManagement.tsx`

### Funcionalidad
CRUD completo de productos del menú del restaurante.

### Contenido

#### Lista de Productos
Cada producto muestra:
- 📦 **Nombre:** Nombre del producto
- 🏷️ **Categoría:** Tipo de producto (Arroces, Tallarines, Bebidas, etc.)
- 💰 **Precio:** Precio unitario en S/.
- 📊 **Stock:** Cantidad disponible
- ✏️ **Editar:** Botón para modificar
- 🗑️ **Eliminar:** Botón para eliminar (con confirmación)

#### Modal de Crear Producto
Campos requeridos:
- Nombre del producto
- Categoría (select con opciones predefinidas)
- Precio unitario
- Stock disponible

#### Modal de Editar Producto
Permite modificar:
- Precio unitario
- Stock disponible
- Nombre (opcional)

### Datos Mostrados
- Total de productos en el inventario
- Precio formateado en soles (S/.)
- Stock en unidades

### Acciones
- ➕ **Crear Producto:** Abre modal con formulario
- ✏️ **Editar Producto:** Modifica precio y stock
- 🗑️ **Eliminar Producto:** Requiere confirmación
- 📄 **Paginación:** Manejo de grandes inventarios

---

## 🍱 Gestión de Combos

**Ruta:** Accesible desde menú lateral  
**Componente:** `components/pages/Combos.tsx`

### Funcionalidad
Administración de combos (paquetes de productos) con precios especiales.

### Contenido

#### Lista de Combos
Cada combo muestra:
- 🍱 **Nombre:** Nombre del combo
- 💰 **Precio:** Precio total en S/.
- 📦 **Productos Incluidos:** Lista de productos con cantidades
- 📊 **Stock:** Disponibilidad
- ✅/❌ **Disponible:** Indicador de disponibilidad (verde/rojo)
- ✏️ **Editar:** Botón para modificar
- 🗑️ **Eliminar:** Botón para eliminar (con confirmación)

#### Modal de Editar Combo
Permite modificar:
- Lista de productos incluidos
- Agregar nuevos productos al combo
- Eliminar productos del combo
- Precio total

### Datos Mostrados
- Precio formateado en S/.
- Lista detallada de productos con cantidades
- Estado de disponibilidad

### Acciones
- ✏️ **Editar Combo:** Modifica productos y precio
- ➕ **Agregar Producto:** Añade producto al combo
- ➖ **Quitar Producto:** Elimina producto del combo
- 🗑️ **Eliminar Combo:** Requiere confirmación

---

## 🎁 Gestión de Ofertas

**Ruta:** Accesible desde menú lateral  
**Componente:** `components/pages/Ofertas.tsx`

### Funcionalidad
Administración de descuentos y promociones por tiempo limitado.

### Contenido

#### Lista de Ofertas
Cada oferta muestra:
- 🍜 **Producto:** Nombre del producto en oferta
- 💰 **Descuento:** Porcentaje de descuento
- 📅 **Fecha Inicio:** Cuándo comienza la oferta
- ⏰ **Fecha Límite:** Cuándo termina la oferta
- ✅/❌ **Estado:** Activa o Inactiva
- ✏️ **Editar:** Botón para modificar
- 🗑️ **Eliminar:** Botón para eliminar (con confirmación)

#### Modal de Editar Oferta
Permite modificar:
- Porcentaje de descuento (1-100%)
- Fecha límite (selector de fecha y hora)

### Datos Mostrados
- Fechas formateadas (DD/MM/YYYY HH:mm)
- Porcentaje con símbolo %
- Estado visual con colores (verde: activa, gris: inactiva)

### Acciones
- ✏️ **Editar Oferta:** Modifica descuento y fechas
- 🗑️ **Eliminar Oferta:** Requiere confirmación
- 📄 **Paginación:** Lista paginada

---

## 👨‍🍳 Gestión de Empleados

**Ruta:** Accesible desde menú lateral  
**Componente:** `components/pages/Empleados.tsx`

### Funcionalidad
Visualización del personal del restaurante y sus métricas de desempeño.

### Contenido

#### Lista de Empleados
Cada empleado muestra:
- 👤 **Nombre Completo:** Nombre del empleado
- 🆔 **DNI:** Documento de identidad
- 💼 **Rol:** Puesto (cocinero, repartidor, despachador, cajero)
- 💰 **Sueldo:** Sueldo mensual en S/.
- ⭐ **Calificación:** Promedio de calificación (1-5 estrellas)
- 📊 **Pedidos Atendidos:** Total de pedidos gestionados
- 💵 **Revenue Generado:** Ingresos totales generados por el empleado

### Datos Mostrados
- Sueldo formateado en S/.
- Calificación con estrellas (⭐)
- Revenue en formato monetario
- Rol con badge de color

### Acciones
- 📄 **Vista de solo lectura:** Sin edición desde el frontend
- 📊 **Métricas de desempeño:** Datos actualizados

---

## ⭐ Gestión de Reseñas

**Ruta:** Accesible desde menú lateral  
**Componente:** `components/pages/Resenas.tsx`

### Funcionalidad
Visualización de reseñas y calificaciones de clientes.

### Contenido

#### Lista de Reseñas
Cada reseña muestra:
- 👤 **Cliente:** Email del usuario
- ⭐ **Calificación:** Estrellas (1-5)
- 💬 **Comentario:** Texto de la reseña
- 📅 **Fecha:** Cuándo se dejó la reseña
- 🍜 **Pedido:** ID del pedido asociado

### Datos Mostrados
- Calificaciones con estrellas visuales
- Comentarios completos
- Fecha formateada

### Acciones
- 📄 **Vista de solo lectura:** Sin responder desde el frontend

---

## 📈 Analítica

**Ruta:** Accesible desde menú lateral  
**Componente:** `components/pages/Analytics.tsx`

### Funcionalidad
Dashboard avanzado con métricas detalladas y análisis de rendimiento del restaurante.

### Contenido

#### KPIs Principales (4 Cards)
- 👥 **Total Empleados:** Con desglose de cocineros y repartidores
- 💰 **Revenue Total:** Con total de clientes únicos
- 📦 **Pedidos Totales:** Con pedidos completados y tasa de éxito
- 📈 **Ticket Promedio:** Con rango (mínimo y máximo)

#### Top Productos Más Vendidos
Lista numerada con:
- 🥇 **Ranking:** Posición (1, 2, 3...)
- 📦 **Nombre del Producto:** Con categoría
- 💰 **Revenue Total:** Ingresos generados
- 📊 **Porcentaje de Ventas:** % del total
- 📈 **Unidades Vendidas:** Cantidad total
- 🍜 **Pedidos que lo Incluyen:** Número de pedidos
- 📦 **Stock Disponible:** Inventario actual

#### Top Personal (Mejores Empleados)
Ranking de empleados por desempeño:
- 🥇 **Ranking:** Posición
- 👤 **Nombre y DNI:** Identificación
- 💼 **Rol:** Puesto
- 📊 **Score de Performance:** Métrica calculada
- ⭐ **Calificación Promedio:** Con estrellas
- 💰 **Revenue Generado:** Ingresos totales
- 📦 **Pedidos Atendidos:** Cantidad de pedidos

#### Records Diarios
Tabla con datos por día:
- 📅 **Fecha:** DD/MM/YYYY
- 📦 **Total Pedidos:** Cantidad del día
- 💰 **Revenue Diario:** Ingresos del día en S/.
- 📈 **Ticket Promedio:** Promedio del día

### Datos Mostrados
- Revenue en S/. con 2 decimales
- Porcentajes con símbolo %
- Calificaciones con estrellas
- Fechas formateadas
- Totales calculados automáticamente

### Acciones
- 🔄 **Auto-actualización:** Carga automática al abrir
- 📊 **Vista completa:** Scroll horizontal/vertical para tablas grandes

---

## 👤 Clientes

**Ruta:** Accesible desde menú lateral  
**Componente:** `components/pages/Customers.tsx`

### Funcionalidad
Visualización de base de datos de clientes.

### Contenido

#### Lista de Clientes
Cada cliente muestra:
- 👤 **Nombre:** Nombre completo
- 📧 **Email:** Correo electrónico
- 📱 **Teléfono:** Número de contacto
- 📦 **Pedidos Totales:** Cantidad de pedidos realizados
- 💰 **Total Gastado:** Suma total en S/.

### Datos Mostrados
- Formato monetario para totales
- Información de contacto completa

### Acciones
- 📄 **Vista de solo lectura:** Sin edición desde el frontend

---

## ⚙️ Configuración de Admin

**Ruta:** Accesible desde menú lateral  
**Componente:** `components/pages/AdminSettings.tsx`

### Funcionalidad
Configuración y ajustes del local.

### Contenido

#### Información del Local
- 🏪 **Nombre del Local**
- 📍 **Dirección**
- 📞 **Teléfono**
- ⏰ **Horario de Apertura**
- ⏰ **Horario de Cierre**

#### Información del Gerente
- 👤 **Nombre**
- 📧 **Email**

### Datos Mostrados
- Horarios en formato 24 horas
- Información de contacto completa

### Acciones
- 📄 **Vista de solo lectura:** Sin edición desde el frontend

---

## 🎨 Características Generales de UI

### Diseño
- **Framework:** Tailwind CSS
- **Componentes:** shadcn/ui (botones, inputs, modals, cards)
- **Iconos:** Lucide React
- **Tema:** Sistema de colores rojo (#dc2626) como color principal

### Responsive Design
- ✅ **Desktop:** Grid layouts optimizados
- ✅ **Tablet:** Adaptación de columnas
- ✅ **Mobile:** Stack vertical (pendiente optimización completa)

### Estados de UI
- **Loading:** Spinners y skeletons animados
- **Error:** Mensajes en rojo con bordes
- **Success:** Mensajes en verde
- **Empty:** Mensajes informativos cuando no hay datos

### Navegación
- **Sidebar:** Menú lateral con íconos y labels
- **Breadcrumbs:** No implementado
- **Tabs:** En páginas con múltiples secciones

### Feedback Visual
- **Confirmaciones:** Alerts nativos de JavaScript (pendiente mejorar con modals)
- **Notificaciones:** Toasts con Sonner (configurado pero no usado extensivamente)
- **Tooltips:** En íconos y botones

### Paginación
- **Componente:** Custom pagination component
- **Items por página:** 10 (configurable)
- **Controles:** Anterior, números de página, Siguiente
- **Total:** Muestra "Mostrando X-Y de Z items"

### Modales
- **Backdrop:** Fondo oscuro semi-transparente
- **Tamaño:** max-w-3xl para detalles complejos
- **Scroll:** Vertical cuando el contenido excede la altura
- **Cierre:** Botón X en esquina superior derecha

### WebSocket (Tiempo Real)
- **Indicador de Conexión:** 🟢 Conectado / 🔴 Desconectado
- **Auto-reconexión:** 3 intentos con 5 segundos de intervalo
- **Scope:** Solo en modal de detalles de pedido
- **Notificaciones:** Lista de últimas 5 actualizaciones

---

## 🔐 Autenticación y Roles

### Login
- Email y contraseña
- Token JWT almacenado en localStorage
- Validación en cada request

### Roles
- **Admin:** Acceso completo a todos los módulos
- **Gerente:** Acceso limitado a su local específico

### Protección de Rutas
- Componente `ProtectedRoute` verifica autenticación
- Redirección automática a `/login` si no hay token

---

## 🌐 Configuración de APIs

### Variables de Entorno (.env.local)
```env
NEXT_PUBLIC_API_USUARIOS_URL=...    # Login, registro
NEXT_PUBLIC_API_LOCALES_URL=...     # Locales, analítica
NEXT_PUBLIC_API_PEDIDOS_URL=...     # Pedidos, workflow
NEXT_PUBLIC_API_EMPLEADOS_URL=...   # Empleados
NEXT_PUBLIC_WS_URL=...              # WebSocket
```

### Microservicios
- 👤 **Usuarios:** Autenticación
- 🏪 **Locales:** Información de locales + Analítica
- 🍜 **Pedidos:** Pedidos + Workflow + WebSocket
- 👨‍🍳 **Empleados:** Personal

---

## 📱 Funcionalidades Pendientes

### Mejoras de UX
- [ ] Reemplazar `alert()` con modals personalizados
- [ ] Implementar sistema de toasts consistente
- [ ] Breadcrumbs en todas las páginas
- [ ] Mejorar responsive en mobile

### Funcionalidades Nuevas
- [ ] Edición de información del local
- [ ] Responder a reseñas
- [ ] Exportar reportes (PDF, CSV)
- [ ] Gráficas de analítica (Chart.js)
- [ ] Filtros avanzados en todas las listas
- [ ] Búsqueda global

### Optimizaciones
- [ ] Caché de datos con React Query
- [ ] Lazy loading de imágenes
- [ ] Code splitting por rutas
- [ ] PWA para uso offline

---

## 🐛 Notas Técnicas

### Manejo de Errores
- Try-catch en todas las llamadas API
- Mensajes de error descriptivos
- Fallback a mensajes genéricos

### Performance
- useMemo para cálculos pesados
- useCallback para funciones en dependencias
- Paginación para evitar renderizar miles de items

### Accesibilidad
- Labels en todos los inputs
- Contraste de colores WCAG AA (parcial)
- Navegación por teclado (pendiente mejorar)

### Seguridad
- Token en headers Authorization
- No se almacenan datos sensibles en localStorage (solo token y email)
- Validación de inputs en frontend (pendiente backend)

---

## 📞 Soporte y Mantenimiento

### Logs
- Console.log para debugging (pendiente sistema de logging)
- Errores capturados en try-catch

### Monitoreo
- Sin sistema de analytics instalado (pendiente)
- Sin error tracking (pendiente Sentry)

---

**Última actualización:** 30 de Noviembre, 2025  
**Versión:** 1.0.0  
**Framework:** Next.js 14 + React 18 + TypeScript
