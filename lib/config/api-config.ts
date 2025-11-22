// API Configuration for multiple microservices
export const API_CONFIG = {
  usuarios: process.env.NEXT_PUBLIC_API_USUARIOS_URL || '',
  locales: process.env.NEXT_PUBLIC_API_LOCALES_URL || '', // Incluye Analítica
  pedidos: process.env.NEXT_PUBLIC_API_PEDIDOS_URL || '', // Incluye Workflow
  empleados: process.env.NEXT_PUBLIC_API_EMPLEADOS_URL || '',
}

export const getApiUrl = (service: keyof typeof API_CONFIG): string => {
  const url = API_CONFIG[service]
  if (!url) {
    console.warn(`API URL for service '${service}' is not configured`)
  }
  return url
}
