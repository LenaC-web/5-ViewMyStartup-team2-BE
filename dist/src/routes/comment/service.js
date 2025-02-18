"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prismaClient_1 = require("../../prismaClient");
// 코멘트 목록 조회
/**
 * @swagger
 * /api/comments:
 *   get:
 *     summary: 모든 코멘트 목록 조회
 *     tags: [Comment]
 *     responses:
 *       200:
 *         description: 코멘트 목록 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   companyId:
 *                     type: string
 *                   content:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: 서버 오류
 */
const getCompaniesCommentList = async (req, res) => {
    try {
        const comments = await prismaClient_1.prisma.companiesComments.findMany({
            where: {
                deletedAt: null, // 삭제되지 않은 코멘트만 조회
            },
            orderBy: {
                createdAt: "desc", // 최신 생성순 정렬
            },
            include: {
                user: true, // 사용자 정보 포함
                company: true, // 회사 정보 포함
            },
        });
        const replacer = (key, value) => {
            if (typeof value === "bigint") {
                return value.toString(); // BigInt를 문자열로 변환
            }
            return value;
        };
        return res.status(200).json(JSON.parse(JSON.stringify(comments, replacer)));
    }
    catch (error) {
        console.error("Error message in getCompaniesCommentList", error);
        return res.status(500).json({ error: "코멘트 목록 조회 실패" });
    }
};
// 코멘트 목록 조회 by ID
/**
 * @swagger
 * /api/comments/{companyId}:
 *   get:
 *     summary: 특정 회사의 코멘트 조회
 *     tags: [Comment]
 *     description: 삭제되지 않은 코멘트만 조회하며, 최신 생성 순으로 정렬합니다.
 *     parameters:
 *       - name: companyId
 *         in: path
 *         description: 조회할 회사의 ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 회사의 코멘트 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   content:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: 회사 ID가 요청에 없을 때
 *       500:
 *         description: 코멘트 조회 중 오류 발생
 */
const getCompaniesCommentListById = async (req, res) => {
    try {
        const { companyId } = req.params; // URL에서 route parameter로 받기 (예: /companies/123/comments)
        console.log("ids:", companyId);
        if (!companyId) {
            return res.status(400).json({ error: "회사 ID가 필요합니다" });
        }
        const comments = await prismaClient_1.prisma.companiesComments.findMany({
            where: {
                companyId,
                deletedAt: null, // 삭제되지 않은 코멘트만 조회
            },
            orderBy: {
                createdAt: "desc", // 최신 생성순 정렬
            },
        });
        return res.status(200).json(comments);
    }
    catch (error) {
        console.error("Error message in getCompaniesCommentListById", error);
        return res.status(500).json({ error: "코멘트 목록 조회 실패" });
    }
};
// 코멘트 생성
/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: 코멘트 생성
 *     tags: [Comment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               companyId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: 생성된 코멘트 반환
 *       500:
 *         description: 서버 오류
 */
const createCompaniesComment = async (req, res) => {
    try {
        const { userId, companyId, content } = req.body;
        const newComment = await prismaClient_1.prisma.companiesComments.create({
            data: {
                userId,
                companyId,
                content,
            },
            include: {
                user: true,
                company: true,
            },
        });
        const replacer = (key, value) => {
            if (typeof value === "bigint") {
                return value.toString();
            }
            return value;
        };
        return res
            .status(201)
            .json(JSON.parse(JSON.stringify(newComment, replacer)));
    }
    catch (error) {
        console.error("Error message in createCompaniesComment", error);
        return res.status(500).json({ error: "코멘트 생성 실패" });
    }
};
// 코멘트 수정
/**
 * @swagger
 * /api/comments/{id}:
 *   patch:
 *     summary: 코멘트 수정
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 수정할 코멘트 ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: 수정된 코멘트 반환
 *       500:
 *         description: 서버 오류
 */
const updateCompaniesComment = async (req, res) => {
    const { id } = req.params;
    console.log(id);
    const { content } = req.body;
    try {
        const updatedComment = await prismaClient_1.prisma.companiesComments.update({
            where: { id },
            data: {
                content,
                updatedAt: new Date(),
            },
            include: {
                user: true,
                company: true,
            },
        });
        const replacer = (key, value) => {
            if (typeof value === "bigint") {
                return value.toString();
            }
            return value;
        };
        return res
            .status(201)
            .json(JSON.parse(JSON.stringify(updatedComment, replacer)));
    }
    catch (error) {
        console.error("Error message in updateCompaniesComment", error);
        return res.status(500).json({ error: "코멘트 수정 실패" });
    }
};
// 코멘트 삭제
/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: 코멘트 삭제
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 삭제할 코멘트 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 삭제 성공 메시지 반환
 *       500:
 *         description: 서버 오류
 */
const deleteCompaniesComment = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedComment = await prismaClient_1.prisma.companiesComments.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });
        return res.status(200).json({ message: "코멘트 삭제 성공" });
    }
    catch (error) {
        console.error("Error message in deleteCompaniesComment", error);
        return res.status(500).json({ error: "코멘트 삭제 실패" });
    }
};
const commentService = {
    getCompaniesCommentList,
    getCompaniesCommentListById,
    createCompaniesComment,
    updateCompaniesComment,
    deleteCompaniesComment,
};
exports.default = commentService;
//# sourceMappingURL=service.js.map