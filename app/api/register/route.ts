import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email;
    const password = body.password;


    if (!email || !password) {
      return NextResponse.json({ error: "Введіть email та пароль" }, { status: 400 });
    }


    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Користувач з таким email вже існує" }, { status: 400 });
    }

    // Шифруємо пароль перед збереженням
    const hashedPassword = await bcrypt.hash(password, 10);

  
    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        role: "USER"
      }
    });

    return NextResponse.json({ message: "Користувача успішно створено!" }, { status: 201 });

  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}