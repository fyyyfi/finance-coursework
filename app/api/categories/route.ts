import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "Користувача не знайдено" }, { status: 404 });
    }

    
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { isDefault: true },
          { userId: user.id }
        ]
      },
    
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(categories);

  } catch (error) {
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
    }

    const body = await request.json();
    const name = body.name;

    if (!name) {
      return NextResponse.json({ error: "Назва категорії обов'язкова" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "Користувача не знайдено" }, { status: 404 });
    }

    // Створюємо нову категорію, яка належить саме цьому користувачу
    const newCategory = await prisma.category.create({
      data: {
        name: name,
        userId: user.id
      }
    });

    return NextResponse.json(newCategory, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}