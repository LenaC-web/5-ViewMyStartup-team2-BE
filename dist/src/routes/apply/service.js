"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prismaClient_1 = require("../../prismaClient");
/**
 * @swagger
 * /api/apply/{id}:
 *   post:
 *     summary: 회사에 지원서를 제출합니다.
 *     description: 이 엔드포인트는 사용자가 회사에 지원서를 제출할 수 있도록 합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 회사의 ID입니다.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyId:
 *                 type: integer
 *                 description: 사용자가 지원하는 회사의 ID입니다.
 *               applicantName:
 *                 type: string
 *                 description: 지원자의 이름입니다.
 *               applicantPosition:
 *                 type: string
 *                 description: 지원자가 지원하는 직무입니다.
 *               applicantComment:
 *                 type: string
 *                 description: 지원자가 작성한 코멘트입니다.
 *     responses:
 *       201:
 *         description: 지원서가 성공적으로 제출되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: 새로 생성된 지원서의 ID입니다.
 *                 companyId:
 *                   type: integer
 *                   description: 회사의 ID입니다.
 *                 applicantName:
 *                   type: string
 *                   description: 지원자의 이름입니다.
 *                 applicantPosition:
 *                   type: string
 *                   description: 지원자가 지원한 직무입니다.
 *                 applicantComment:
 *                   type: string
 *                   description: 지원자가 작성한 코멘트입니다.
 *       500:
 *         description: 서버 내부 오류
 */
// 지원서 제출(POST /api/apply)
const applyForCompany = async (req, res) => {
    const { companyId, applicantName, applicantPosition, applicantComment } = req.body;
    try {
        // 지원서 데이터 저장
        const newApplication = await prismaClient_1.prisma.userApplications.create({
            data: {
                companyId,
                userId: req.user.id, // 로그인한 사용자 ID
                status: "PENDING", // 기본 상태는 'PENDING'
                applicantName,
                applicantPosition,
                applicantComment,
            },
        });
        res.status(201).json(newApplication); // 성공적으로 생성된 지원서 반환
    }
    catch (error) {
        console.error("Error in applyForCompany", error);
        res.status(500).json({ message: "지원서 제출 실패" });
    }
};
const applyService = {
    applyForCompany,
};
exports.default = applyService;
//# sourceMappingURL=service.js.map