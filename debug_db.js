
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const messages = await prisma.copilotMessage.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6
    });
    messages.reverse().forEach(m => {
        console.log(`[${m.role.toUpperCase()}]: ${m.content.substring(0, 100)}${m.content.length > 100 ? '...' : ''}`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
