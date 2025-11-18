import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export default function Promotions() {
  const [promotions, setPromotions] = useState([
    {
      id: 1,
      name: 'ChinaWeek',
      discount: '40%',
      description: 'Descuento en toda la carta',
      active: true,
      startDate: '2024-01-10',
      endDate: '2024-01-14'
    },
    {
      id: 2,
      name: 'Encaje al Wok',
      discount: '30%',
      description: 'En platos seleccionados',
      active: true,
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    },
    {
      id: 3,
      name: 'Banquetazo',
      discount: '25%',
      description: 'En combos para 4+ personas',
      active: false,
      startDate: '2024-02-01',
      endDate: '2024-02-28'
    }
  ])

  const togglePromotion = (id: number) => {
    setPromotions(promotions.map(p => 
      p.id === id ? { ...p, active: !p.active } : p
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-end">
        <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 font-medium">
          <Plus size={20} />
          Nueva Promoción
        </button>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map((promo) => (
          <div key={promo.id} className={`rounded-lg border-2 p-6 transition ${
            promo.active ? 'border-red-600 bg-red-50' : 'border-gray-200 bg-gray-50'
          }`}>
            {/* Discount Badge */}
            <div className="mb-4">
              <span className="inline-block bg-red-600 text-white text-3xl font-bold px-4 py-2 rounded-lg">
                {promo.discount}
              </span>
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">{promo.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{promo.description}</p>

            {/* Dates */}
            <div className="mb-4 text-xs text-gray-500">
              <p>Del {promo.startDate} al {promo.endDate}</p>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                promo.active ? 'bg-green-200 text-green-700' : 'bg-gray-200 text-gray-700'
              }`}>
                {promo.active ? 'Activa' : 'Pausada'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => togglePromotion(promo.id)}
                className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-2 font-medium ${
                  promo.active
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                {promo.active ? <EyeOff size={18} /> : <Eye size={18} />}
                {promo.active ? 'Pausar' : 'Activar'}
              </button>
              <button className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition">
                <Edit size={18} />
              </button>
              <button className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
