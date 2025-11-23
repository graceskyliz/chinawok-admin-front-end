import { Save, Lock, User } from 'lucide-react'
import { useState } from 'react'

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    storeName: 'Chinawok Lima Miraflores',
    email: 'admin@chinawok.com',
    phone: '01-6128000',
    address: 'Av. Larco 123, Miraflores, Lima'
  })

  const handleChange = (field: string, value: any) => {
    setSettings({ ...settings, [field]: value })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Store Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="text-red-600" size={24} />
          <h3 className="text-lg font-bold text-gray-900">Información de la Tienda</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Nombre de la Tienda</label>
            <input
              type="text"
              value={settings.storeName}
              onChange={(e) => handleChange('storeName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Teléfono</label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Dirección</label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="text-red-600" size={24} />
          <h3 className="text-lg font-bold text-gray-900">Seguridad</h3>
        </div>

        <button className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-medium">
          Cambiar Contraseña
        </button>
      </div>

      {/* Save Button */}
      <button className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2">
        <Save size={20} />
        Guardar Cambios
      </button>
    </div>
  )
}
