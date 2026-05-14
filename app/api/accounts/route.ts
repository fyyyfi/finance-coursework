import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    // 1. Перевіряємо, чи користувач увійшов в систему
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

    const accounts = await prisma.account.findMany({
      where: { userId: user.id }
    });

    return NextResponse.json(accounts);

  } catch (error) {
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 1. Перевіряємо авторизацію
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
    }

    // 2. Отримуємо дані з форми (назву і початковий баланс)
    const body = await request.json();
    const name = body.name;
    const balance = body.balance;

    if (!name) {
      return NextResponse.json({ error: "Назва рахунку обов'язкова" }, { status: 400 });
    }

    // 3. Знаходимо користувача в базі
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "Користувача не знайдено" }, { status: 404 });
    }

    // 4. Створюємо новий рахунок і прив'язуємо до користувача
    const newAccount = await prisma.account.create({
      data: {
        name: name,
        balance: Number(balance) || 0, 
        userId: user.id
      }
    });

    return NextResponse.json(newAccount, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}