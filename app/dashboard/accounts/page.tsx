"use client";

import { useState, useEffect } from "react";

// Простий тип для нашого рахунку, щоб TypeScript розумів, з чим ми працюємо
type Account = {
  id: string;
  name: string;
  balance: number;
};

export default function AccountsPage() {
  // Змінні для збереження списку рахунків та даних з форми
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Ця функція завантажує рахунки з нашого бекенду
  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/accounts");
      if (response.ok) {
        const data = await response.json();
        setAccounts(data); // Зберігаємо отримані рахунки в змінну
      }
    } catch (error) {
      console.error("Помилка при завантаженні рахунків:", error);
    } finally {
      setIsLoading(false); // Вимикаємо індикатор завантаження
    }
  };

  // Викликаємо функцію завантаження один раз при відкритті сторінки
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Ця функція спрацьовує при натисканні на кнопку "Створити рахунок"
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Зупиняємо стандартне перезавантаження сторінки
    setError("");

    if (!name) {
      setError("Введіть назву рахунку");
      return;
    }

    try {
      // Відправляємо дані на наш бекенд
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          balance: balance ? Number(balance) : 0, // Перетворюємо текст на число
        }),
      });

      if (response.ok) {
        // Якщо все успішно - очищаємо форму
        setName("");
        setBalance("");
        // Оновлюємо список рахунків на екрані
        fetchAccounts();
      } else {
        const data = await response.json();
        setError(data.error || "Помилка при створенні");
      }
    } catch (error) {
      setError("Сталася помилка. Спробуйте ще раз.");
    }
  };

  // Показуємо цей текст, поки чекаємо відповідь від сервера
  if (isLoading) {
    return <div className="p-4 text-gray-500">Завантаження рахунків...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Мої рахунки</h1>

      {/* Форма для додавання нового рахунку */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8 max-w-xl">
        <h2 className="text-xl font-semibold mb-4">Додати новий рахунок</h2>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Назва (наприклад: Готівка, Монобанк)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введіть назву"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Початковий баланс (₴)
            </label>
            <input
              type="number"
              step="0.01" // Дозволяємо вводити копійки
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700 w-fit transition"
          >
            Створити рахунок
          </button>
        </form>
      </div>

      {/* Виведення списку існуючих рахунків */}
      <h2 className="text-xl font-semibold mb-4">Список рахунків</h2>
      
      {accounts.length === 0 ? (
        <p className="text-gray-500 bg-white p-4 rounded border border-gray-100">
          У вас ще немає жодного рахунку. Створіть перший!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <div 
              key={account.id} 
              className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center"
            >
              <span className="font-medium text-gray-800">{account.name}</span>
              <span className="text-xl font-bold text-blue-600">{account.balance} ₴</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}