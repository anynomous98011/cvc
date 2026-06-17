const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const indexes = await prisma.$runCommandRaw({ listIndexes: 'User' });
    console.log(JSON.stringify(indexes, null, 2));
  } catch (e) {
    console.error('Error listing indexes:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
