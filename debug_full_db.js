
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const messages = await prisma.copilotMessage.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10
    });
    messages.reverse().forEach(m => {
        console.log(`--- [${m.role.toUpperCase()}] at ${m.createdAt} ---`);
        console.log(m.content);
        console.log(`Length: ${m.content.length}`);
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
