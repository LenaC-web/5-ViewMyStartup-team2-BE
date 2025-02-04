import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 유저 데이터 추가
  const user1 = await prisma.users.create({
    data: {
      email: "user1@example.com",
      password: "password123", // 암호화된 비밀번호로 변경 필요
      name: "John Doe",
      nickname: "johnny",
    },
  });

  const user2 = await prisma.users.create({
    data: {
      email: "user2@example.com",
      password: "password123", // 암호화된 비밀번호로 변경 필요
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
