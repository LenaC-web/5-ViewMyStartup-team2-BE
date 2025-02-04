"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const ko_1 = require("@faker-js/faker/locale/ko");
const companyIds_1 = require("./companyIds");
const prisma = new client_1.PrismaClient();
async function main() {
    const USER_COUNT = 100;
    await prisma.bookmark.deleteMany();
    await prisma.userApplications.deleteMany();
    await prisma.users.deleteMany();
    for (let i = 0; i < USER_COUNT; i++) {
        const userName = ko_1.faker.person.fullName();
        const user = await prisma.users.create({
            data: {
                email: ko_1.faker.internet.email(),
                password: "password123",
                name: userName,
                nickname: userName + ko_1.faker.number.int({ min: 1, max: 999 }),
            },
        });
        const bookmarkCount = ko_1.faker.number.int({ min: 5, max: 30 });
        const shuffledCompaniesForBookmark = ko_1.faker.helpers.shuffle([...companyIds_1.companyIds]);
        const selectedCompaniesForBookmark = shuffledCompaniesForBookmark.slice(0, bookmarkCount);
        for (const companyId of selectedCompaniesForBookmark) {
            await prisma.bookmark.create({
                data: {
                    userId: user.id,
                    companyId,
                },
            });
        }
        const applicationCount = ko_1.faker.number.int({ min: 5, max: 30 });
        const shuffledCompaniesForApplication = ko_1.faker.helpers.shuffle([
            ...companyIds_1.companyIds,
        ]);
        const selectedCompaniesForApplication = shuffledCompaniesForApplication.slice(0, applicationCount);
        for (const companyId of selectedCompaniesForApplication) {
            const status = ko_1.faker.helpers.arrayElement([
                client_1.ApplicationStatus.PENDING,
                client_1.ApplicationStatus.ACCEPTED,
                client_1.ApplicationStatus.REJECTED,
            ]);
            await prisma.userApplications.create({
                data: {
                    userId: user.id,
                    companyId,
                    status,
                },
            });
        }
        if ((i + 1) % 10 === 0) {
            console.log(`Created ${i + 1} users with their bookmarks and applications`);
        }
    }
    const userCount = await prisma.users.count();
    const bookmarkCount = await prisma.bookmark.count();
    const applicationCount = await prisma.userApplications.count();
    console.log("\nSeed data creation completed!");
    console.log(`Created ${userCount} users`);
    console.log(`Created ${bookmarkCount} bookmarks`);
    console.log(`Created ${applicationCount} applications`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=userApplicationsSeed.js.map