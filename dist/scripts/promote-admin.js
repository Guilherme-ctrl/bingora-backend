"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const email = process.argv[2]?.trim().toLowerCase();
    if (!email) {
        console.error('Uso: promote-admin.ts <email>');
        process.exit(1);
    }
    const updated = await prisma.organizer.updateMany({
        where: { email },
        data: { role: client_1.OrganizerRole.admin },
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
//# sourceMappingURL=promote-admin.js.map