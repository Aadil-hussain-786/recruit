// @ts-ignore
import { PrismaClient } from '@prisma/client';
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing Prisma connection...');
        const result = await (prisma as any).user.findMany();
        console.log('Prisma connection successful. Found', result.length, 'users.');
    } catch (error) {
        console.error('Prisma connection failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
