'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, LogOut, Home, ShoppingCart, BarChart3, Utensils, Users, Settings, User, Mail, UserCircle, Briefcase, Package, MessageSquare } from 'lucide-react'
import { useAuth } from '@/lib/contexts/auth-context'
import { authService, UserInfoResponse } from '@/lib/services/auth-service'
import Dashboard from '@/components/pages/Dashboard'
import MenuManagement from '@/components/pages/MenuManagement'
import Orders from '@/components/pages/Orders'
import Analytics from '@/components/pages/Analytics'
import AdminSettings from '@/components/pages/AdminSettings'
import Empleados from '@/components/pages/Empleados'
import Resenas from '@/components/pages/Resenas'
import Combos from '@/components/pages/Combos'
import Ofertas from '@/components/pages/Ofertas'

type Page = 'dashboard' | 'menu' | 'orders' | 'combos' | 'ofertas' | 'analytics' | 'empleados' | 'resenas' | 'settings'

export default function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfoResponse['usuario'] | null>(null)
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(false)
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (userMenuOpen && !target.closest('.user-menu-container')) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userMenuOpen])

  const fetchUserInfo = async () => {
    if (userInfo) {
      setUserMenuOpen(!userMenuOpen)
      return
    }
    
    setIsLoadingUserInfo(true)
    setUserMenuOpen(true)
    try {
      const response = await authService.getUserInfo()
      setUserInfo(response.usuario)
    } catch (err) {
      console.error('Error fetching user info:', err)
    } finally {
      setIsLoadingUserInfo(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'menu', label: 'Productos', icon: Utensils },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
    { id: 'combos', label: 'Combos', icon: Package },
    { id: 'ofertas', label: 'Ofertas', icon: BarChart3 },
    { id: 'analytics', label: 'Análisis', icon: BarChart3 },
    { id: 'empleados', label: 'Empleados', icon: Briefcase },
    { id: 'resenas', label: 'Reseñas', icon: MessageSquare },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ]

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'menu':
        return <MenuManagement />
      case 'orders':
        return <Orders />
      case 'combos':
        return <Combos />
      case 'ofertas':
        return <Ofertas />
      case 'analytics':
        return <Analytics />
      case 'empleados':
        return <Empleados />
      case 'resenas':
        return <Resenas />
      case 'settings':
        return <AdminSettings />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-bold text-lg">
                CW
              </div>
              <span className="font-bold text-xl">CHINAWOK</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id as Page)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  currentPage === item.id
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-600 hover:bg-gray-800 rounded-lg transition"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Cerrar sesión</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {menuItems.find((m) => m.id === currentPage)?.label || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4 relative user-menu-container">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'Usuario'}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
              <p className="text-xs text-red-600 font-medium capitalize">{user?.role}</p>
            </div>
            <button
              onClick={fetchUserInfo}
              className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold hover:bg-red-700 transition relative"
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </button>

            {/* User Info Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 top-14 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                {isLoadingUserInfo ? (
                  <div className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-300 rounded w-full"></div>
                    </div>
                  </div>
                ) : userInfo ? (
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                      <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                        {userInfo.nombre?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {userInfo.nombre} {userInfo.apellido || ''}
                        </h3>
                        <span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                          {userInfo.role}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Mail size={16} className="text-gray-400" />
                        <span className="text-gray-600">{userInfo.correo}</span>
                      </div>
                      
                      {userInfo.historial_pedidos && userInfo.historial_pedidos.length > 0 && (
                        <div className="flex items-center gap-3 text-sm">
                          <ShoppingCart size={16} className="text-gray-400" />
                          <span className="text-gray-600">
                            {userInfo.historial_pedidos.length} pedidos realizados
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setUserMenuOpen(false)}
                      className="mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition"
                    >
                      Cerrar
                    </button>
                  </div>
                ) : (
                  <div className="p-6">
                    <p className="text-sm text-red-600">Error al cargar información del usuario</p>
                    <button
                      onClick={() => setUserMenuOpen(false)}
                      className="mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition"
                    >
                      Cerrar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {renderPage()}
          </div>
        </div>
      </div>
    </div>
  )
}
