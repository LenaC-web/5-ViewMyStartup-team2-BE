import { PrismaClient } from "@prisma/client";
import { COMPANIES } from "./mock";

const prisma = new PrismaClient();

async function main() {
  // 1. 카테고리 데이터 삽입 (중복 카테고리 방지)
  const categories = await Promise.all(
    [...new Set(COMPANIES.map((company) => company.category))].map(
      async (categoryName) => {
        // 카테고리 존재 여부 확인 (category는 유니크한 값이 아니기 때문에 findFirst로 검색)
        let existingCategory = await prisma.category.findFirst({
          where: { category: categoryName },
        });

        if (!existingCategory) {
          // 카테고리가 존재하지 않으면 새로 생성
          existingCategory = await prisma.category.create({
            data: { category: categoryName },
          });
        }

        return existingCategory;
      }
    )
  );

  // 2. 회사 데이터 삽입 (Companies 테이블)
  for (const company of COMPANIES) {
    const createdCompany = await prisma.companies.create({
      data: {
        name: company.name,
        image: company.image || null, // 이미지가 없으면 null로 처리
        content: company.content,
        salesRevenue: company.salesRevenue,
        employeeCnt: company.employeeCnt,
        createdAt: new Date(company.createdAt),
        updatedAt: new Date(company.updatedAt),
        deletedAt: null, // 삭제된 데이터는 없다고 가정
        // 카테고리 연결 (다대다 관계)
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
