import { ApplicationStatus } from "@prisma/client";
import { Request, Response } from "express";
interface QueryType {
    page?: string;
    filter?: string;
}
interface ApplicationDTO {
    id?: string;
    name: string;
    image: string | null;
    content: string;
    category: {
        id: string;
        category: string;
    }[];
    status: ApplicationStatus | string;
    applicantCnt: number;
    createdAt?: Date;
    updatedAt?: Date;
}
interface ApplicationListResponse {
    applications: ApplicationDTO[];
    page: number;
    totalPages: number;
}
interface ErrorResponse {
    message: string;
}
/**
 * @swagger
 * /api/applications/{userId}:
 *   get:
 *     summary: 지원 내역 조회
 *     description: 사용자가 지원한 기업 목록을 조회합니다.
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자의 고유 ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [all, PENDING, ACCEPTED, REJECTED]
 *           default: all
 *         description: 지원 상태 필터 (전체 / 대기중 / 합격 / 불합격)
 *     responses:
 *       200:
 *         description: 지원 내역 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 applications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: 지원서 ID
 *                       companyId:
 *                         type: string
 *                         description: 기업 ID
 *                       name:
 *                         type: string
 *                         description: 기업 이름
 *                       image:
 *                         type: string
 *                         description: 기업 이미지 URL
 *                       content:
 *                         type: string
 *                         description: 기업 설명
 *                       category:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: 기업 카테고리
 *                       status:
 *                         type: string
 *                         enum: [PENDING, ACCEPTED, REJECTED]
 *                         description: 지원 상태
 *                       applicantCnt:
 *                         type: integer
 *                         description: 지원자 수
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: 지원 일자
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: 마지막 수정 일자
 *                 page:
 *                   type: integer
 *                   description: 현재 페이지 번호
 *                 totalPages:
 *                   type: integer
 *                   description: 전체 페이지 수
 *       400:
 *         description: 요청 파라미터 오류
 *       500:
 *         description: 서버 오류
 */
interface ParamsType {
    userId: string;
}
declare const getApplicationList: (req: Request<ParamsType, {}, {}, QueryType>, res: Response<ApplicationListResponse | ErrorResponse>) => Promise<Response<ApplicationListResponse | ErrorResponse, Record<string, any>>>;
export default getApplicationList;
