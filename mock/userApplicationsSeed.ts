import { PrismaClient, ApplicationStatus } from "@prisma/client";
import { faker } from "@faker-js/faker/locale/ko";
import { companyIds } from "./companyIds";

const prisma = new PrismaClient();

async function main() {
  const USER_COUNT = 100;

  // 기존 데이터 삭제
  await prisma.bookmark.deleteMany();
  await prisma.userApplications.deleteMany();
  await prisma.users.deleteMany();

  // 사용자 100명 생성
  for (let i = 0; i < USER_COUNT; i++) {
    // 사용자 기본 정보 생성
    const userName = faker.person.fullName();

    const user = await prisma.users.create({
      data: {
        email: faker.internet.email(),
        password: "password123", // 해시화 없이 단순 문자열로 저장
        name: userName, // 생성한 이름 사용
        nickname: userName + faker.number.int({ min: 1, max: 999 }), // 이름 + 숫자
      },
    });

    // 북마크 생성 (5~30개, 중복 없이)
    const bookmarkCount = faker.number.int({ min: 5, max: 30 });
    const shuffledCompaniesForBookmark = faker.helpers.shuffle([...companyIds]);
    const selectedCompaniesForBookmark = shuffledCompaniesForBookmark.slice(
      0,
      bookmarkCount
    );

    for (const companyId of selectedCompaniesForBookmark) {
      await prisma.bookmark.create({
        data: {
          userId: user.id,
          companyId,
        },
      });
    }

    // 지원 내역 생성 (5~30개, 중복 없이)
    const applicationCount = faker.number.int({ min: 5, max: 30 });
    const shuffledCompaniesForApplication = faker.helpers.shuffle([
      ...companyIds,
    ]);
    const selectedCompaniesForApplication =
      shuffledCompaniesForApplication.slice(0, applicationCount);

    for (const companyId of selectedCompaniesForApplication) {
      const status = faker.helpers.arrayElement([
        ApplicationStatus.PENDING,
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.REJECTED,
      ]);

      await prisma.userApplications.create({
        data: {
          userId: user.id,
          companyId,
          status,
        },
      });
    }

    // 진행 상황 로깅
    if ((i + 1) % 10 === 0) {
      console.log(
        `Created ${i + 1} users with their bookmarks and applications`
      );
    }
  }

  // 최종 데이터 수 확인
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
