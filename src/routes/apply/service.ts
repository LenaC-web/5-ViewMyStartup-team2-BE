import { prisma } from "../../prismaClient";
import { Request, Response } from "express";

/**
 * @swagger
 * /api/apply/{id}:
 *   post:
 *     summary: 기업에 지원서 제출
 *     description: 사용자가 특정 기업에 지원서를 제출합니다.
 *     tags: [Apply]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자의 고유 ID (로그인한 사용자 ID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyId:
 *                 type: string
 *                 description: 기업 ID
 *               applicantName:
 *                 type: string
 *                 description: 지원자의 이름
 *               applicantPosition:
 *                 type: string
 *                 description: 지원자의 직책
 *               applicantComment:
 *                 type: string
 *                 description: 지원자가 작성한 자기소개
 *     responses:
 *       201:
 *         description: 지원서 제출 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: 지원서 ID
 *                 companyId:
 *                   type: string
 *                   description: 기업 ID
 *                 userId:
 *                   type: string
 *                   description: 사용자의 고유 ID
 *                 status:
 *                   type: string
 *                   enum: [PENDING, ACCEPTED, REJECTED]
 *                   description: 지원 상태
 *                 applicantName:
 *                   type: string
 *                   description: 지원자의 이름
 *                 applicantPosition:
 *                   type: string
 *                   description: 지원자의 직책
 *                 applicantComment:
 *                   type: string
 *                   description: 지원자가 작성한 자기소개
 *       400:
 *         description: 잘못된 요청 파라미터
 *       500:
 *         description: 서버 오류
 */

// 지원서 제출(POST /api/apply)
const applyForCompany = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { companyId, applicantName, applicantPosition, applicantComment } =
    req.body;
  try {
    // 지원서 데이터 저장
    const newApplication = await prisma.userApplications.create({
      data: {
        companyId,
        userId: id, // 로그인한 사용자 ID
        status: "PENDING", // 기본 상태는 'PENDING'
        applicantName,
        applicantPosition,
        applicantComment,
      },
    });

    res.status(201).json(newApplication); // 성공적으로 생성된 지원서 반환
  } catch (error) {
    console.error("Error in applyForCompany", error);
    res.status(500).json({ message: "지원서 제출 실패" });
  }
};

const applyService = {
  applyForCompany,
};

export default applyService;
