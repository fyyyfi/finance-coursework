"use client";

import { useState, useEffect } from "react";

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Стейт для фільтрів
  const [filterType, setFilterType] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetch("/api/transactions")
      .then(res => res.json())
      .then(data => {
        setTransactions(data);
        setFilteredData(data);
        setIsLoading(false);
      });
  }, []);

  // Логіка фільтрації
  useEffect(() => {
    let result = [...transactions];

    if (filterType !== "ALL") {
      result = result.filter(t => t.type === filterType);
    }

    if (startDate) {
      result = result.filter(t => new Date(t.date) >= new Date(startDate));
    }

    if (endDate) {
      result = result.filter(t => new Date(t.date) <= new Date(endDate));
    }

    setFilteredData(result);
  }, [filterType, startDate, endDate, transactions]);

  // ФУНКЦІЯ ЕКСПОРТУ В CSV (Excel розуміє цей формат)
  const exportToCSV = () => {
    const headers = ["Дата", "Тип", "Сума", "Категорія", "Рахунок", "Опис"];
    const rows = filteredData.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.type === "INCOME" ? "Дохід" : "Витрата",
      t.amount,
      t.category.name,
      t.account.name,
      t.description
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `report_${new Date().toLocaleDateString()}.csv`);
    link.click();
  };

  if (isLoading) return <div className="p-4">Завантаження...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Детальні звіти</h1>
        <button 
          onClick={exportToCSV}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Експорт в Excel (CSV)
        </button>
      </div>

      {/* Панель фільтрів */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Тип операції</label>
          <select 
            className="border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="ALL">Всі</option>
            <option value="INCOME">Доходи</option>
            <option value="EXPENSE">Витрати</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Від</label>
          <input 
            type="date" 
            className="border border-gray-300 rounded px-3 py-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">До</label>
          <input 
            type="date" 
            className="border border-gray-300 rounded px-3 py-2"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Таблиця */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold text-gray-700">Дата</th>
              <th className="p-4 font-semibold text-gray-700">Категорія</th>
              <th className="p-4 font-semibold text-gray-700">Рахунок</th>
              <th className="p-4 font-semibold text-gray-700">Сума</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredData.map(t => (
              <tr key={t.id} className="hover:bg-gray-50 transition">
                <td className="p-4 text-gray-600">{new Date(t.date).toLocaleDateString()}</td>
                <td className="p-4 font-medium text-gray-800">{t.category.name}</td>
                <td className="p-4 text-gray-600">{t.account.name}</td>
                <td className={`p-4 font-bold ${t.type === 'EXPENSE' ? 'text-red-500' : 'text-green-500'}`}>
                  {t.type === 'EXPENSE' ? '-' : '+'}{t.amount} ₴
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}