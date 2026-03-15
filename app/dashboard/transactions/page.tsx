"use client";

import { useState, useEffect } from "react";

// Описуємо, як виглядають наші дані
type Account = { id: string; name: string; balance: number };
type Category = { id: string; name: string };
type Transaction = {
  id: string;
  amount: number;
  type: string;
  description: string;
  date: string;
  account: { name: string };
  category: { name: string };
};

export default function TransactionsPage() {
  // Зберігаємо списки для випадаючих меню та таблиці
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Дані самої форми
  const [type, setType] = useState("EXPENSE"); // За замовчуванням - витрата
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Завантажуємо всі необхідні дані при відкритті сторінки
  const fetchData = async () => {
    try {
      const [accRes, catRes, transRes] = await Promise.all([
        fetch("/api/accounts"),
        fetch("/api/categories"),
        fetch("/api/transactions")
      ]);

      if (accRes.ok) setAccounts(await accRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (transRes.ok) setTransactions(await transRes.json());
    } catch (err) {
      console.error("Помилка завантаження даних", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Відправка форми
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!amount || !accountId || !categoryId) {
      setError("Будь ласка, заповніть суму, рахунок та категорію");
      return;
    }

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          amount: Number(amount),
          accountId,
          categoryId,
          description
        }),
      });

      if (response.ok) {
        // Очищаємо форму після успіху
        setAmount("");
        setDescription("");
        // Оновлюємо дані на сторінці
        fetchData();
      } else {
        const data = await response.json();
        setError(data.error || "Помилка при збереженні");
      }
    } catch (err) {
      setError("Сталася помилка сервера");
    }
  };

  if (isLoading) return <div className="p-4">Завантаження...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Операції</h1>

      {/* Форма додавання */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8 max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Додати операцію</h2>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="EXPENSE">Витрата</option>
                <option value="INCOME">Дохід</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Сума (₴)</label>
              <input 
                type="number" 
                step="0.01"
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Рахунок</label>
              <select 
                value={accountId} 
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Оберіть рахунок...</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name} ({acc.balance} ₴)</option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Категорія</label>
              <select 
                value={categoryId} 
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Оберіть категорію...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Коментар (необов'язково)</label>
            <input 
              type="text" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Наприклад: Обід в їдальні"
            />
          </div>

          <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700 w-fit">
            Зберегти
          </button>
        </form>
      </div>

      {/* Список останніх операцій */}
      <h2 className="text-xl font-semibold mb-4">Історія операцій</h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {transactions.length === 0 ? (
          <p className="p-6 text-gray-500">Операцій ще немає.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((t) => (
              <div key={t.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-800">{t.category.name}</p>
                  <p className="text-sm text-gray-500">{t.account.name} • {t.description}</p>
                </div>
                <div className={`font-bold ${t.type === 'EXPENSE' ? 'text-red-500' : 'text-green-500'}`}>
                  {t.type === 'EXPENSE' ? '-' : '+'}{t.amount} ₴
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}