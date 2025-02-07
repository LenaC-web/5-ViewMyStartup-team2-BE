import { prisma } from "../../prismaClient";
import { Request, Response } from "express";

// 📝북마크 목록 조회
const getBookmarks = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    // 1. 사용자의 즐겨찾기 목록 조회
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: userId,
        deletedAt: null, // 삭제되지 않은 즐겨찾기만 조회
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    if (bookmarks.length === 0) {
      return res
        .status(404)
        .json({ message: "해당 사용자의 즐겨찾기가 없습니다." });
    }
    res.status(200).json(bookmarks);
  } catch (err) {
    console.error("Error message in getBookmarks", err);
    res.status(500).json({ message: "즐겨찾기 조회 실패" });
  }
};

// 📝북마크 생성
const createBookmark = async (req: Request, res: Response) => {
  const { userId } = req.params; // URL의 userId 파라미터 받기
  const { companyId } = req.body; // 요청 본문에서 companyId 받기
  try {
    // 1. 유효성 검증: 사용자가 이미 해당 회사에 대해 즐겨찾기를 추가했는지 확인
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        userId: userId,
        companyId: companyId,
        deletedAt: null, // 삭제되지 않은 즐겨찾기만 조회
      },
    });
    // 이미 즐겨찾기로 존재하는 경우
    if (existingBookmark) {
      return res
        .status(400)
        .json({ message: "이 기업은 이미 즐겨찾기로 등록되어 있습니다." });
    }
    // 2. 즐겨찾기 추가
    const newBookmark = await prisma.bookmark.create({
      data: {
        userId,
        companyId,
      },
    });
    res.status(201).json(newBookmark); // 생성된 북마크 반환
  } catch (err) {
    console.error("Error message in createBookmark", err);
    res.status(500).json({ message: "즐겨찾기 추가 실패" });
  }
};

// 📝북마크 삭제
const deleteBookmark = async (req: Request, res: Response) => {
  const { userId } = req.params; // URL의 userId 파라미터 받기
  const { companyId } = req.body; // 요청 본문에서 companyId 받기
  try {
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        userId: userId,
        companyId: companyId,
        deletedAt: null, // 삭제되지 않은 즐겨찾기만 조회
      },
    });
    if (!bookmark) {
      return res
        .status(404)
        .json({ message: "해당 즐겨찾기를 찾을 수 없습니다." });
    }
    //삭제날짜
    const deletedBookmark = await prisma.bookmark.update({
      where: {
        id: bookmark.id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    res.status(200).json(deletedBookmark);
  } catch (err) {
    console.error("Error message in deleteBookmark", err);
    res.status(500).json({ message: "즐겨찾기 삭제 실패" });
  }
};

const bookmarkService = {
  getBookmarks,
  createBookmark,
  deleteBookmark,
};

export default bookmarkService;
