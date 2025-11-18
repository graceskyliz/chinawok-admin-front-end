import { Mail, Phone, Calendar, MapPin } from 'lucide-react'

export default function Customers() {
  const customers = [
    {
      id: 1,
      name: 'Juan García',
      email: 'juan@email.com',
      phone: '987654321',
      orders: 12,
      spent: 'S/. 450.50',
      joined: '2023-06-15',
      avatar: 'JG'
    },
    {
      id: 2,
      name: 'María López',
      email: 'maria@email.com',
      phone: '912345678',
      orders: 8,
      spent: 'S/. 289.90',
      joined: '2023-08-20',
      avatar: 'ML'
    },
    {
      id: 3,
      name: 'Carlos Mendez',
      email: 'carlos@email.com',
      phone: '956789012',
      orders: 15,
      spent: 'S/. 650.20',
      joined: '2023-05-10',
      avatar: 'CM'
    },
    {
      id: 4,
      name: 'Ana Rodríguez',
      email: 'ana@email.com',
      phone: '923456789',
      orders: 6,
      spent: 'S/. 195.40',
      joined: '2023-11-01',
      avatar: 'AR'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm mb-2">Total de Clientes</p>
          <p className="text-3xl font-bold text-gray-900">1,324</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm mb-2">Clientes Activos (30d)</p>
          <p className="text-3xl font-bold text-gray-900">452</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm mb-2">Ticket Promedio</p>
          <p className="text-3xl font-bold text-gray-900">S/. 36.50</p>
        </div>
      </div>

      {/* Customers List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 gap-4 p-6">
          {customers.map((customer) => (
            <div key={customer.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                    {customer.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{customer.name}</h4>
                    <p className="text-sm text-gray-500">{customer.orders} pedidos • S/. {customer.spent}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">ID: #{customer.id}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={16} />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={16} />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} />
                  <span>{customer.joined}</span>
                </div>
                <button className="text-red-600 font-medium hover:text-red-700">
                  Ver Perfil →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
