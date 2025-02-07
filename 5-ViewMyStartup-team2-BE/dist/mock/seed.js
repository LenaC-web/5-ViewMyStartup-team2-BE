"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const ko_1 = require("@faker-js/faker/locale/ko");
const mock_1 = require("./mock");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("기존데이터를 삭제합니다.");
    await prisma.bookmark.deleteMany();
    await prisma.userApplications.deleteMany();
    await prisma.users.deleteMany();
    await prisma.companies.deleteMany();
    const USER_COUNT = 100;
    const categories = await Promise.all([...new Set(mock_1.COMPANIES.map((company) => company.category))].map(async (categoryName) => {
        let existingCategory = await prisma.category.findFirst({
            where: { category: categoryName },
        });
        if (!existingCategory) {
            existingCategory = await prisma.category.create({
                data: { category: categoryName },
            });
        }
        return existingCategory;
    }));
    const createdCompanies = [];
    for (const company of mock_1.COMPANIES) {
        const createdCompany = await prisma.companies.create({
            data: {
                name: company.name,
                image: company.image || null,
                content: company.content,
                salesRevenue: company.salesRevenue,
                employeeCnt: company.employeeCnt,
                createdAt: new Date(company.createdAt),
                updatedAt: new Date(company.updatedAt),
                deletedAt: null,
                category: {
                    connect: categories
                        .filter((cat) => company.category === cat.category)
                        .map((cat) => ({ id: cat.id })),
                },
            },
        });
        createdCompanies.push(createdCompany);
        console.log(`${createdCompany.name} 회사 등록이 완료되었습니다. `);
    }
    const companyIds = createdCompanies.map((company) => company.id);
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
        const shuffledCompaniesForBookmark = ko_1.faker.helpers.shuffle([...companyIds]);
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
            ...companyIds,
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
    throw e;
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map