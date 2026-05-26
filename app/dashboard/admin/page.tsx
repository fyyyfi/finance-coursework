"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [totalTransactions, setTotalTransactions] = useState<number | string>("Завантаження...");
  const [newCatName, setNewCatName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Завантажуємо кількість транзакцій для статистики системи
  useEffect(() => {
    if (session && (session.user as any).role === "ADMIN") {
      fetch("/api/transactions")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setTotalTransactions(data.length);
        })
        .catch(() => setTotalTransactions(0));
    }
  }, [session]);

  if (status === "loading") return <p className="p-4">Перевірка прав...</p>;

  if (!session || (session.user as any).role !== "ADMIN") {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-xl text-red-700">
        <h2 className="text-2xl font-bold mb-2">Доступ обмежено</h2>
        <p>Ця сторінка доступна лише для адміністраторів системи.</p>
      </div>
    );
  }

  // Функція відправки нової глобальної категорії
  const handleCreateGlobalCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName }),
      });

      if (res.ok) {
        alert(`Глобальну категорію "${newCatName}" успішно додано!`);
        setNewCatName("");
      } else {
        const errData = await res.json();
        alert(errData.error || "Помилка при створенні");
      }
    } catch (error) {
      alert("Сталася помилка зв'язку з сервером");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Панель Адміністратора</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Картка статистики */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-800">Статистика системи</h3>
            <p className="text-gray-600 mb-2">👤 Користувачів в базі: <span className="font-semibold text-gray-900">1 (Ви)</span></p>
            <p className="text-gray-600">📊 Всього транзакцій в системі: <span className="font-semibold text-gray-900">{totalTransactions}</span></p>
          </div>
        </div>
        
        {/* Картка управління категоріями */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-2 text-gray-800">Управління базовими категоріями</h3>
          <p className="text-sm text-gray-500 mb-4">Тут адмін може створювати нові вбудовані категорії для всіх користувачів.</p>
          
          <form onSubmit={handleCreateGlobalCategory} className="flex flex-col gap-3">
            <input 
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Назва глобальної категорії"
              className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
            <button 
              type="submit"
              disabled={isSubmitting || !newCatName.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed text-center"
            >
              {isSubmitting ? "Збереження..." : "Додати глобальну категорію"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}