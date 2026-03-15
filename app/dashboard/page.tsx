export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Огляд фінансів</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Загальний баланс</h3>
          <p className="text-3xl font-bold mt-2">0 ₴</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Доходи цього місяця</h3>
          <p className="text-3xl font-bold text-green-500 mt-2">+0 ₴</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Витрати цього місяця</h3>
          <p className="text-3xl font-bold text-red-500 mt-2">-0 ₴</p>
        </div>
      </div>
    </div>
  );
}