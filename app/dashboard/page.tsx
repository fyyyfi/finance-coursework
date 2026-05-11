"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Кольори для секторів графіку
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

  const fetchData = async () => {
    try {
      const [accRes, transRes] = await Promise.all([
        fetch("/api/accounts"),
        fetch("/api/transactions"),
      ]);

      if (accRes.ok && transRes.ok) {
        const accounts = await accRes.json();
        const transactions = await transRes.json();

        // 1. Рахуємо баланси (як раніше)
        const total = accounts.reduce((sum: number, acc: any) => sum + acc.balance, 0);
        
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let income = 0;
        let expenses = 0;
        const categoryMap: { [key: string]: number } = {};

        transactions.forEach((t: any) => {
          const tDate = new Date(t.date);
          if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
            if (t.type === "INCOME") {
              income += t.amount;
            } else {
              expenses += t.amount;
              // Групуємо витрати для графіка
              const catName = t.category.name;
              categoryMap[catName] = (categoryMap[catName] || 0) + t.amount;
            }
          }
        });

        // Форматуємо дані для Recharts
        const formattedChartData = Object.keys(categoryMap).map((name) => ({
          name,
          value: categoryMap[name],
        }));

        setStats({ totalBalance: total, monthlyIncome: income, monthlyExpenses: expenses });
        setChartData(formattedChartData);
      }
    } catch (error) {
      console.error("Помилка завантаження даних:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) return <div className="p-8 text-center">Завантаження...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Огляд фінансів</h1>
      
      {/* Картки статистики */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Загальний баланс</h3>
          <p className="text-3xl font-bold mt-2 text-gray-900">{stats.totalBalance.toLocaleString()} ₴</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
          <h3 className="text-gray-500 text-sm font-medium">Доходи (місяць)</h3>
          <p className="text-3xl font-bold mt-2 text-green-600">+{stats.monthlyIncome.toLocaleString()} ₴</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-red-500">
          <h3 className="text-gray-500 text-sm font-medium">Витрати (місяць)</h3>
          <p className="text-3xl font-bold mt-2 text-red-600">-{stats.monthlyExpenses.toLocaleString()} ₴</p>
        </div>
      </div>

      {/* Секція з графіком */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Аналіз витрат за категоріями</h2>
        
        <div className="h-[400px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              Немає даних для відображення графіка. Додайте витрати цього місяця!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}