import { Request, Response, NextFunction } from "express";
import { prisma } from "../../prismaClient";

// 테스트용 미들웨어
const testUserMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //XXX: 임의로 가져온 사용자 id
    const testUserId = "5744b58a-fc08-4bba-9e66-67f195ead2e1";

    // 데이터베이스에 해당 사용자가 존재하는지 확인
    const user = await prisma.users.findUnique({
      where: { id: testUserId },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "테스트 사용자를 찾을 수 없습니다." });
    }

    // req 객체에 user 정보 추가
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    console.error("Test User Middleware Error:", error);
    res.status(500).json({ message: "서버 에러입니다." });
  }
};

export default testUserMiddleware;
