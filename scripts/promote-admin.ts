/**
 * Promove um organizador a admin pelo e-mail.
 * Uso: npx ts-node -r dotenv/config scripts/promote-admin.ts seu@email.com
 */
import 'dotenv/config';
import { OrganizerRole, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error('Uso: promote-admin.ts <email>');
    process.exit(1);
  }
  const updated = await prisma.organizer.updateMany({
    where: { email },
    data: { role: OrganizerRole.admin },
  });
  if (updated.count === 0) {
    console.error(`Nenhum usuário com e-mail: ${email}`);
    process.exit(1);
  }
  console.log(`OK: ${email} agora é admin. Faça login de novo para atualizar o token.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
