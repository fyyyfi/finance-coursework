import { PrismaClient } from '@prisma/client';

// Зберігаємо підключення в глобальній змінній, 
// щоб воно не створювалося наново при кожному збереженні коду
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}