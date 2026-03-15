import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
      <div className="text-center max-w-xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Особистий фінансовий трекер
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Зручний інструмент для обліку ваших доходів та витрат. Керуйте бюджетом легко та ефективно.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link 
            href="/login" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Увійти
          </Link>
          <Link 
            href="/register" 
            className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition"
          >
            Реєстрація
          </Link>
        </div>
      </div>
    </main>
  );
}