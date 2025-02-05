"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const mock_1 = require("./mock");
const prisma = new client_1.PrismaClient();
async function main() {
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
        console.log(`${createdCompany.name} 회사 등록이 완료되었습니다. `);
    }
    console.log("mock데이터 삽입이 완료되었습니다.");
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