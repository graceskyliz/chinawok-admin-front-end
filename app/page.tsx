'use client'

import { useState } from 'react'
import { Menu, LogOut, Home, ShoppingCart, BarChart3, Utensils, Users, Settings } from 'lucide-react'
import Dashboard from '@/components/pages/Dashboard'
import MenuManagement from '@/components/pages/MenuManagement'
import Orders from '@/components/pages/Orders'
import Analytics from '@/components/pages/Analytics'
import Promotions from '@/components/pages/Promotions'
import Customers from '@/components/pages/Customers'
import AdminSettings from '@/components/pages/AdminSettings'

type Page = 'dashboard' | 'menu' | 'orders' | 'analytics' | 'promotions' | 'customers' | 'settings'

export default function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'menu', label: 'Menú', icon: Utensils },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
    { id: 'promotions', label: 'Promociones', icon: BarChart3 },
    { id: 'analytics', label: 'Análisis', icon: BarChart3 },
    { id: 'customers', label: 'Clientes', icon: Users },
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
      case 'analytics':
        return <Analytics />
      case 'promotions':
        return <Promotions />
      case 'customers':
        return <Customers />
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
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-600 hover:bg-gray-800 rounded-lg transition">
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
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Admin Manager</p>
              <p className="text-xs text-gray-500">admin@chinawok.com</p>
            </div>
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
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
