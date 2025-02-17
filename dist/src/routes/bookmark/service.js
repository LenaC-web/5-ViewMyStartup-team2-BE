"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prismaClient_1 = require("../../prismaClient");
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
 *       - name: sort
 *         in: query
 *         description: 정렬기준 0은 기본 값
 *         enum:
 *           - 0  # 기본값
 *           - 1  # 지원한 기업 우선
 *           - 2  # 지원하지 않은 기업 우선
 *           - 3  # 직원 수 적은 순
 *           - 4  # 직원 수 많은 순
 *         required: false
 *         schema:
 *           type: integer
 *           default: 0
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
const getBookmarks = async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10, sort = 0 } = req.query;
    if (!userId) {
        return res.status(400).json({ message: "잘못된 userId입니다." });
    }
    try {
        // 즐겨찾기 목록 조회
        const bookmarks = await prismaClient_1.prisma.bookmark.findMany({
            where: {
                userId: userId,
                deletedAt: null,
            },
            orderBy: {
                createdAt: "desc", // 기본적으로 최신순
            },
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
        const companyIds = bookmarks.map((bookmark) => bookmark.companyId);
        const companies = await prismaClient_1.prisma.companies.findMany({
            where: {
                id: { in: companyIds },
            },
            select: {
                id: true,
                name: true,
                content: true,
                employeeCnt: true,
                category: true,
                image: true,
            },
        });
        const companyApplicantCount = await prismaClient_1.prisma.userApplications.groupBy({
            by: ["companyId"],
            _count: {
                companyId: true,
            },
        });
        const companyApplicantMap = companyApplicantCount.reduce((acc, curr) => {
            acc[curr.companyId] = curr._count.companyId;
            return acc;
        }, {});
        const appliedCompanies = await prismaClient_1.prisma.userApplications.findMany({
            where: { userId },
            select: { companyId: true },
        });
        const appliedCompanyIds = new Set(appliedCompanies.map((app) => app.companyId));
        let companiesWithAppliedStatus = companies.map((company) => ({
            ...company,
            applied: appliedCompanyIds.has(company.id),
            applicants: companyApplicantMap[company.id] || 0,
        }));
        companiesWithAppliedStatus.sort((a, b) => {
            if (sort === "0") {
                return;
            }
            if (sort === "1") {
                return Number(b.applied) - Number(a.applied); // 지원한 기업 우선
            }
            if (sort === "2") {
                return Number(a.applied) - Number(b.applied); // 지원 안한 기업 우선
            }
            if (sort === "3") {
                return a.employeeCnt - b.employeeCnt; // 직원 수 적은 순
            }
            if (sort === "4") {
                return b.employeeCnt - a.employeeCnt; // 직원 수 많은 순
            }
            if (sort === "5") {
                return b.applicants - a.applicants; // 지원자 수 많은 순
            }
            if (sort === "6") {
                return a.applicants - b.applicants; // 지원자 수 적은 순
            }
        });
        const offset = (Number(page) - 1) * Number(limit);
        const pagedCompanies = companiesWithAppliedStatus.slice(offset, offset + Number(limit));
        const totalItems = companies.length;
        const totalPages = Math.ceil(totalItems / Number(limit));
        const currentPage = Number(page);
        res.status(200).json({
            companies: pagedCompanies,
            currentPage,
            totalPages,
        });
    }
    catch (err) {
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
const createBookmark = async (req, res) => {
    const { userId } = req.params; // URL의 userId 파라미터 받기
    const { companyId } = req.body; // 요청 본문에서 companyId 받기
    try {
        // 1. 유효성 검증: 사용자가 이미 해당 회사에 대해 즐겨찾기를 추가했는지 확인
        const existingBookmark = await prismaClient_1.prisma.bookmark.findFirst({
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
        const newBookmark = await prismaClient_1.prisma.bookmark.create({
            data: {
                userId,
                companyId,
            },
        });
        res.status(201).json(newBookmark); // 생성된 북마크 반환
    }
    catch (err) {
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
const deleteBookmark = async (req, res) => {
    const { userId } = req.params; // URL의 userId 파라미터 받기
    const { companyId } = req.body; // 요청 본문에서 companyId 받기
    try {
        const bookmark = await prismaClient_1.prisma.bookmark.findFirst({
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
        const deletedBookmark = await prismaClient_1.prisma.bookmark.update({
            where: {
                id: bookmark.id,
            },
            data: {
                deletedAt: new Date(),
            },
        });
        res.status(200).json(deletedBookmark);
    }
    catch (err) {
        console.error("Error message in deleteBookmark", err);
        res.status(500).json({ message: "즐겨찾기 삭제 실패" });
    }
};
const bookmarkService = {
    getBookmarks,
    createBookmark,
    deleteBookmark,
};
exports.default = bookmarkService;
//# sourceMappingURL=service.js.map