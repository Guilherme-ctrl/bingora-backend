/**
 * Remove todos os eventos (e dados em cascata: prêmios, cartelas, vendas, etc.).
 * Mantém contas de organizadores.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.event.deleteMany({});
  console.log(`Removidos ${result.count} evento(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
