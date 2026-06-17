const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$runCommandRaw({ dropIndexes: 'User', index: 'User_googleId_key' });
    console.log('Index dropped successfully');
  } catch (e) {
    console.error('Error dropping index:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
