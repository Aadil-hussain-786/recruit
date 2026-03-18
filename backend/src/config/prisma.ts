// @ts-ignore
import { PrismaClient } from '@prisma/client';
import "dotenv/config";

console.log('Initializing Prisma Client...');
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

export default prisma;
