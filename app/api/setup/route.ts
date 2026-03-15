import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    // Список категорій, які будуть доступні всім (можеш додати свої)
    const defaultCategories = [
      { name: "Продукти", isDefault: true },
      { name: "Транспорт", isDefault: true },
      { name: "Комуналка та Зв'язок", isDefault: true },
      { name: "Здоров'я", isDefault: true },
      { name: "Одяг", isDefault: true },
      { name: "Кафе та Ресторани", isDefault: true },
      { name: "Розваги", isDefault: true },
      { name: "Зарплата", isDefault: true },
    ];

    // Перевіряємо, чи ми вже не створювали їх раніше, щоб не було дублікатів
    const existingDefaults = await prisma.category.findFirst({
      where: { isDefault: true }
    });

    if (existingDefaults) {
      return NextResponse.json({ message: "Базові категорії вже існують!" });
    }

    // Зберігаємо їх у базу
    const created = await prisma.category.createMany({
      data: defaultCategories
    });

    return NextResponse.json({ 
      message: "Успіх! Базові категорії створено.", 
      count: created.count 
    });

  } catch (error) {
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}