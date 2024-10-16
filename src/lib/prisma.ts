import { PrismaClient } from '@prisma/client'

declare global {
    namespace NodeJS {
        interface Global {
            prisma: PrismaClient | undefined;
        }
    }
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient()
} else {
    if (!(globalThis as any).prisma) {
        (globalThis as any).prisma = new PrismaClient()
    }
    prisma = (globalThis as any).prisma as PrismaClient
}

export default prisma
