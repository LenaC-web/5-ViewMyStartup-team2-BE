import { prisma } from "../../prismaClient";
import { Request, Response } from "express";

// 📝회사 상세 조회 getCompanyDetail (지원자 수 포함)
const getCompanyDetail = async (req: Request, res: Response) => {
  const { id } = req.params;  // 요청받은 회사 ID
  try {
    // 회사 정보 조회
    const company = await prisma.companies.findUnique({
      where: {
        id,
        deletedAt: null,  // 삭제되지 않은 기업만 조회
      },
    });

    if (!company) {
      return res.status(404).json({ message: "해당 기업을 찾을 수 없습니다." });
    }

    // 해당 회사의 지원자 수 계산
    const applicantCount = await prisma.userApplications.count({
      where: {
        companyId: id,  // 해당 회사에 지원한 사람 수
      },
    });

    // 회사 정보를 반환하면서 salesRevenue를 BigInt에서 String으로 변환
    const formattedCompany = {
      ...company,
      salesRevenue: company.salesRevenue ? company.salesRevenue.toString() : "0", // BigInt를 문자열로 변환
      applicantCount, // 지원자 수 포함
    };

    res.status(200).json(formattedCompany); // 회사 세부 정보와 지원자 수 반환
  } catch (err) {
    console.error("Error message in getCompanyDetail", err);
    res.status(500).json({ message: "기업 상세 조회 실패" });
  }
};

const companyDetailService = {
  getCompanyDetail,
};

export default companyDetailService;