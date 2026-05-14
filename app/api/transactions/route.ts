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
      where: { email: session.user.email },
      include: { accounts: { select: { id: true } } }
    });

    if (!user) return NextResponse.json({ error: "Користувача не знайдено" }, { status: 404 });

    const accountIds = user.accounts.map(acc => acc.id);

    // Шукаємо транзакції, які належать рахункам цього користувача
    const transactions = await prisma.transaction.findMany({
      where: { accountId: { in: accountIds } },
      include: {
        account: { select: { name: true } },
        category: { select: { name: true } }
      },
      orderBy: { date: 'desc' } 
    });

    return NextResponse.json(transactions);

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
    const { amount, type, description, accountId, categoryId, date } = body;

    if (!amount || !type || !accountId || !categoryId) {
      return NextResponse.json({ error: "Заповніть всі обов'язкові поля" }, { status: 400 });
    }

    const account = await prisma.account.findUnique({
      where: { id: accountId }
    });

    if (!account) {
      return NextResponse.json({ error: "Рахунок не знайдено" }, { status: 404 });
    }

    const numAmount = Number(amount);
    let newBalance = account.balance;

    if (type === "EXPENSE") {
      newBalance -= numAmount; 
    } else if (type === "INCOME") {
      newBalance += numAmount; 
    }

    // Використовуємо prisma.$transaction, щоб виконати дві дії одночасно:
    // 1. Створити запис про транзакцію
    // 2. Оновити баланс рахунку
    const result = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          amount: numAmount,
          type: type,
          description: description || "",
          accountId: accountId,
          categoryId: categoryId,
          date: date ? new Date(date) : new Date(), // Якщо дату не передали, беремо поточну
        }
      }),
      prisma.account.update({
        where: { id: accountId },
        data: { balance: newBalance }
      })
    ]);

    return NextResponse.json(result[0], { status: 201 });

  } catch (error) {
    console.error("Транзакція помилка:", error);
    return NextResponse.json({ error: "Помилка при збереженні транзакції" }, { status: 500 });
  }
}