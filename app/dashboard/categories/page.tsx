"use client";

import { useState, useEffect } from "react";

type Category = {
  id: string;
  name: string;
  isDefault: boolean;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Помилка при завантаженні:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ФУНКЦІЯ ДЛЯ СТВОРЕННЯ БАЗОВИХ КАТЕГОРІЙ
  const handleSetupDefaults = async () => {
    try {
      const response = await fetch("/api/setup");
      const data = await response.json();
      alert(data.message || data.error);
      fetchCategories(); // Одразу оновлюємо список на екрані, щоб вони з'явилися
    } catch (error) {
      alert("Помилка при створенні базових категорій");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name) {
      setError("Введіть назву категорії");
      return;
    }

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name }),
      });

      if (response.ok) {
        setName("");
        fetchCategories(); 
      } else {
        const data = await response.json();
        setError(data.error || "Помилка при створенні");
      }
    } catch (error) {
      setError("Сталася помилка.");
    }
  };

  if (isLoading) {
    return <div className="p-4 text-gray-500">Завантаження...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 max-w-xl">
        <h1 className="text-3xl font-bold text-gray-800">Категорії</h1>
        
        {/* Кнопка для генерації (показується тільки якщо категорій мало) */}
        {categories.length < 5 && (
          <button
            onClick={handleSetupDefaults}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium transition"
          >
            Згенерувати базові категорії
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8 max-w-xl">
        <h2 className="text-xl font-semibold mb-4">Створити власну категорію</h2>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Наприклад: Кава, Спорт, Книги"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700 transition"
          >
            Додати
          </button>
        </form>
      </div>

      <h2 className="text-xl font-semibold mb-4">Ваші категорії</h2>
      
      {categories.length === 0 ? (
        <p className="text-gray-500 bg-white p-4 rounded border border-gray-100">
          У вас ще немає категорій.
        </p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className={`px-4 py-2 rounded-full border text-sm font-medium ${
                category.isDefault 
                  ? "bg-gray-100 border-gray-200 text-gray-600" 
                  : "bg-blue-50 border-blue-200 text-blue-700"  
              }`}
            >
              {category.name}
              {category.isDefault && <span className="ml-2 text-xs opacity-50">(базова)</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}