"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function AdminPage() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p className="p-4">Перевірка прав...</p>;

  // Перевіряємо роль (Ми додали поле role у Prisma схему раніше)
  if (!session || (session.user as any).role !== "ADMIN") {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-xl text-red-700">
        <h2 className="text-2xl font-bold mb-2">Доступ обмежено</h2>
        <p>Ця сторінка доступна лише для адміністраторів системи.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Панель Адміністратора</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4">Статистика системи</h3>
          <p className="text-gray-600">Користувачів: 1 (Ви)</p>
          <p className="text-gray-600">Всього транзакцій: Завантаження...</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4">Управління базовими категоріями</h3>
          <p className="text-sm text-gray-500 mb-4">Тут адміністратор може додавати нові категорії для всіх користувачів.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded opacity-50 cursor-not-allowed">
            Додати глобальну категорію
          </button>
        </div>
      </div>
    </div>
  );
}