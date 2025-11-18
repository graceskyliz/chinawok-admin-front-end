import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { useState } from 'react'

export default function MenuManagement() {
  const [searchTerm, setSearchTerm] = useState('')

  const menuItems = [
    { id: 1, name: 'Arroz Chaufa', category: 'Clásicos', price: 'S/. 18.90', stock: 45, image: '🍚' },
    { id: 2, name: 'Tallarín Saltado', category: 'Clásicos', price: 'S/. 16.90', stock: 32, image: '🍜' },
    { id: 3, name: 'Wantán Frito', category: 'Complementos', price: 'S/. 12.90', stock: 28, image: '🥟' },
    { id: 4, name: 'Combo Personal', category: 'Combos', price: 'S/. 24.90', stock: 15, image: '🍱' },
    { id: 5, name: 'Encaje al Wok', category: 'Sabor Al Wok', price: 'S/. 19.90', stock: 22, image: '🍜' }
  ]

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar platos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>
        <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 font-medium">
          <Plus size={20} />
          Nuevo Plato
        </button>
      </div>

      {/* Menu Items Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Plato</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Categoría</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Precio</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Stock</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item, idx) => (
              <tr key={item.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200 hover:bg-gray-100 transition`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.image}</span>
                    <p className="font-medium text-gray-900">{item.name}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                <td className="px-6 py-4 font-semibold text-gray-900">{item.price}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    item.stock > 20 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {item.stock} unid.
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition">
                    <Edit size={18} />
                  </button>
                  <button className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
