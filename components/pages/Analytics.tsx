'use client'

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Sales */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Ventas por Semana</h3>
          <div className="h-72 bg-gradient-to-b from-red-50 to-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 text-sm">Gráfico de Barras</p>
              <p className="text-gray-400 text-xs mt-2">Lun: 2.4k | Mar: 1.4k | Mié: 9.8k | Jue: 3.9k | Vie: 4.8k | Sab: 3.8k | Dom: 4.3k</p>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Distribución por Categoría</h3>
          <div className="h-72 bg-gradient-to-b from-red-50 to-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded-full" />
                <span className="text-sm text-gray-700">Clásicos: 35%</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 bg-orange-600 rounded-full" />
                <span className="text-sm text-gray-700">Combos: 25%</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 bg-amber-500 rounded-full" />
                <span className="text-sm text-gray-700">Sabor Al Wok: 20%</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full" />
                <span className="text-sm text-gray-700">Complementos: 20%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Trend */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Tendencia Diaria</h3>
          <div className="h-72 bg-gradient-to-b from-red-50 to-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-600 text-sm">Gráfico de Líneas - Tendencia de Ventas</p>
          </div>
        </div>
      </div>
    </div>
  )
}
