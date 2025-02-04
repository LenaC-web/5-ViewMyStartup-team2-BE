"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const user1 = await prisma.users.create({
        data: {
            email: "user1@example.com",
            password: "password123",
            name: "John Doe",
            nickname: "johnny",
        },
    });
    const user2 = await prisma.users.create({
        data: {
            email: "user2@example.com",
            password: "password123",
            name: "Jane Smith",
            nickname: "janey",
        },
    });
    console.log("Seeding completed!");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=userseed.js.map