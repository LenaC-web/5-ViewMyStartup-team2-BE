import { prisma } from "../../prismaClient";
import { Request, Response } from "express";

/**
 * @swagger
 * /api/bookmarks/{userId}:
 *   get:
 *     tags:
 *       - Bookmarks
 *     summary: 사용자의 즐겨찾기 목록 조회
 *     description: 사용자의 즐겨찾기 목록을 조회합니다. 페이지네이션과 필터링을 지원합니다.
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: user ID
 *         required: true
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         description: 페이지 번호
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: 한 페이지에 표시할 항목 수
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: 즐겨찾기 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalPages:
 *                   type: integer
 *                   description: 전체 페이지 수
 *                 currentPage:
 *                   type: integer
 *                   description: 현재 페이지
 *                 bookmarks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       employeeCnt:
 *                         type: integer
 *                       category:
 *                         type: string
 *       400:
 *         description: 잘못된 userId 또는 요청 파라미터
 *       404:
 *         description: 즐겨찾기 데이터 없음
 *       500:
 *         description: 서버 오류
 */
// 📝북마크 목록 조회
const getBookmarks = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "잘못된 userId입니다." });
  }

  try {
    const offset = (Number(page) - 1) * Number(limit);

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: userId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: Number(offset),
      take: Number(limit),
      select: {
        id: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (bookmarks.length === 0) {
      return res.status(404).json({ message: "즐겨찾기 데이터 없음" });
    }

    const companies = await prisma.companies.findMany({
      where: {
        id: { in: bookmarks.map((bookmark) => bookmark.companyId) },
      },
      select: {
        id: true,
        name: true,
        employeeCnt: true,
        category: true,
      },
    });

    const totalItems = await prisma.bookmark.count({
      where: {
        userId: userId,
        deletedAt: null,
      },
    });
    const totalPages = Math.ceil(totalItems / Number(limit));
    const currentPage = Math.floor(Number(offset) / Number(limit)) + 1;

    res.status(200).json({
      companies,
      currentPage,
      totalPages,
    });
  } catch (err) {
    console.error("Error message in getBookmarks", err);
    res.status(500).json({ message: "즐겨찾기 조회 실패" });
  }
};

/**
 * @swagger
 * /api/bookmarks/{userId}:
 *   post:
 *     summary: bookmark 생성
 *     tags: [Bookmarks]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The user ID for adding a new bookmark
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyId:
 *                 type: string
 *                 description: The ID of the company to be bookmarked
 *                 example: "12345"
 *     responses:
 *       201:
 *         description: The bookmark was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 companyId:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bookmark already exists for this company
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /api/bookmarks/{userId}:
 *   delete:
 *     summary: 즐겨찾기 삭제
 *     tags: [Bookmarks]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The user ID for deleting a bookmark
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyId:
 *                 type: string
 *                 description: The ID of the company to be removed from bookmarks
 *                 example: "12345"
 *     responses:
 *       200:
 *         description: Bookmark successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 companyId:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 deletedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Bookmark not found
 *       500:
 *         description: Internal server error
 */
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
