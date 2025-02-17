"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prismaClient_1 = require("../../prismaClient");
/**
 * @swagger
 * /api/company-detail/{id}:
 *   get:
 *     summary: 기업 세부 정보 조회
 *     description: 기업의 세부 정보를 조회하고 지원자 수를 반환합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 조회할 기업의 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 기업 세부 정보와 지원자 수
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: 기업 ID
 *                 name:
 *                   type: string
 *                   description: 기업 이름
 *                 salesRevenue:
 *                   type: string
 *                   description: 기업 매출액 (BigInt를 문자열로 변환)
 *                 applicantCount:
 *                   type: integer
 *                   description: 지원자 수
 *                 employeeCnt:
 *                   type: integer
 *                   description: 직원 수
 *                 content:
 *                   type: string
 *                   description: 기업 설명
 *       404:
 *         description: 해당 기업을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류
 */
// 📝회사 상세 조회 getCompanyDetail (지원자 수 포함)
const getCompanyDetail = async (req, res) => {
    const { id } = req.params; // 요청받은 회사 ID
    try {
        // 회사 정보 조회
        const company = await prismaClient_1.prisma.companies.findUnique({
            where: {
                id,
                deletedAt: null, // 삭제되지 않은 기업만 조회
            },
        });
        if (!company) {
            return res.status(404).json({ message: "해당 기업을 찾을 수 없습니다." });
        }
        // 해당 회사의 지원자 수 계산
        const applicantCount = await prismaClient_1.prisma.userApplications.count({
            where: {
                companyId: id, // 해당 회사에 지원한 사람 수
            },
        });
        // 회사 정보를 반환하면서 salesRevenue를 BigInt에서 String으로 변환
        const formattedCompany = {
            ...company,
            salesRevenue: company.salesRevenue
                ? company.salesRevenue.toString()
                : "0", // BigInt를 문자열로 변환
            applicantCount, // 지원자 수 포함
        };
        res.status(200).json(formattedCompany); // 회사 세부 정보와 지원자 수 반환
    }
    catch (err) {
        console.error("Error message in getCompanyDetail", err);
        res.status(500).json({ message: "기업 상세 조회 실패" });
    }
};
const companyDetailService = {
    getCompanyDetail,
};
exports.default = companyDetailService;
//# sourceMappingURL=service.js.map