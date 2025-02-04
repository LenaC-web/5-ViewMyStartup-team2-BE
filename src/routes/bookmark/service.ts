import { prisma } from "../../prismaClient";
import { Request, Response } from "express";

// 요청 데이터 타입 정의
interface BookmarkRequest {
  userId: string;
  companyId: string;
}

// 📝북마크 목록 조회
const getBookmarks = async (userId: string) => {
  try {
    // 1. 사용자의 즐겨찾기 목록 조회
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId,
        deletedAt: null, // 삭제되지 않은 즐겨찾기만 조회
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return bookmarks;
  } catch (err) {
    console.error("Error message in getBookmarks", err);
    throw new Error("즐겨찾기 조회 실패");
  }
};

// 📝북마크 생성
const createBookmark = async ({ userId, companyId }: BookmarkRequest) => {
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
      throw new Error("이 기업은 이미 즐겨찾기로 등록되어 있습니다.");
    }
    // 2. 즐겨찾기 추가
    const newBookmark = await prisma.bookmark.create({
      data: {
        userId,
        companyId,
      },
    });
    return newBookmark;
  } catch (err) {
    console.error("Error message in createBookmark", err);
    throw new Error("즐겨찾기 추가 실패");
  }
};

// 📝북마크 삭제
const deleteBookmark = async ({ userId, companyId }: BookmarkRequest) => {
  try {
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        userId: userId,
        companyId: companyId,
        deletedAt: null, // 삭제되지 않은 즐겨찾기만 조회
      },
    });
    if (!bookmark) {
      throw new Error("이미 삭제된 즐겨찾기입니다.");
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
    return deletedBookmark;
  } catch (err) {
    console.error("Error message in deleteBookmark", err);
    throw new Error("즐겨찾기 삭제 실패");
  }
};

const bookmarkService = {
  getBookmarks,
  createBookmark,
  deleteBookmark,
};

export default bookmarkService;
