"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname(); // Дозволяє дізнатися поточне посилання

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center">Завантаження...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Бокове меню */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Мій Бюджет</h2>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link 
            href="/dashboard" 
            className={`block px-4 py-2 rounded ${pathname === '/dashboard' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Головна
          </Link>
          <Link 
            href="/dashboard/accounts" 
            className={`block px-4 py-2 rounded ${pathname === '/dashboard/accounts' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Рахунки
          </Link>
          <Link 
            href="/dashboard/categories" 
            className={`block px-4 py-2 rounded ${pathname === '/dashboard/categories' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Категорії
          </Link>
          <Link 
            href="/dashboard/transactions" 
            className={`block px-4 py-2 rounded ${pathname === '/dashboard/transactions' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Операції
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 truncate mb-2">
            {session?.user?.email}
          </p>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full bg-red-50 text-red-600 px-4 py-2 rounded hover:bg-red-100 transition text-sm font-medium"
          >
            Вийти з акаунта
          </button>
        </div>
      </aside>

      {/* Основний контент (сюди будуть підставлятися наші сторінки) */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}