import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  dbReachable: boolean | null | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function isDatabaseReachable(): Promise<boolean> {
  if (globalForPrisma.dbReachable !== null && globalForPrisma.dbReachable !== undefined) {
    return globalForPrisma.dbReachable;
  }

  if (!process.env.DATABASE_URL) {
    globalForPrisma.dbReachable = false;
    return false;
  }

  try {
    // Probe database with 600ms timeout to avoid hanging when Postgres is down
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('DB connection probe timeout')), 600)),
    ]);
    globalForPrisma.dbReachable = true;
    return true;
  } catch {
    globalForPrisma.dbReachable = false;
    return false;
  }
}

export default prisma;
