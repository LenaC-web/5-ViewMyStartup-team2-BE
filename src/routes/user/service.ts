import { prisma } from "../../prismaClient";
import { Request, Response } from "express";

// 사용자 목록 가져오기
const getuserList = async (req: Request, res: Response) => {
  try {
    const users = await prisma.users.findMany({
      where: {
        deletedAt: null, // 소프트 삭제된 데이터 제외
      },
    });
    return res.status(200).json(users); // 사용자 목록을 JSON 형식으로 응답
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "서버 오류" });
  }
};

// 사용자 등록
const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, name, nickname } = req.body;
    const newUser = await prisma.users.create({
      data: {
        email,
        password,
        name,
        nickname,
      },
    });
    return res.status(201).json(newUser); // 새 사용자 등록 후 응답
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "서버 오류" });
  }
};

// 로그인 처리 (단순 예시, 실제로는 비밀번호 비교 및 JWT 등을 처리해야 함)
const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    if (!user || user.password !== password) {
      return res.status(400).json({ error: "잘못된 이메일 또는 비밀번호" });
    }

    return res.status(200).json(user); // 로그인 성공 시 사용자 정보 응답
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "서버 오류" });
  }
};

// 사용자 프로필 조회
const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.users.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다" });
    }

    return res.status(200).json(user); // 사용자 프로필 정보 응답
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "서버 오류" });
  }
};

// 사용자 프로필 수정
const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, password, name, nickname } = req.body;

    const updatedUser = await prisma.users.update({
      where: { id },
      data: {
        email,
        password,
        name,
        nickname,
      },
    });

    return res.status(200).json(updatedUser); // 업데이트된 사용자 프로필 응답
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "서버 오류" });
  }
};

// 사용자 삭제
const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedUser = await prisma.users.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({ message: "사용자 삭제 성공" }); // 사용자 삭제 성공 메시지
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "서버 오류" });
  }
};

const service = {
  getuserList,
  createUser,
  loginUser,
  getUser,
  updateUser,
  deleteUser,
};

export default service;
