import { Prisma } from "@prisma/client";
import { prisma } from "src/prismaClient";
import { Request, Response } from "express";
import { handleError } from "../err/errHandler";

// 데이터베이스 스키마와 일치하는 정확한 타입을 자동으로 생성
// image: true 일 때 값이 빈문자열, null 상관없음
type AppliedCompany = Prisma.UserApplicationsGetPayload<{
  select: {
    companyId: true;
  };
}>;

type CompanyDetails = Prisma.CompaniesGetPayload<{
  select: {
    id: true;
    name: true;
    image: true;
    content: true;
    salesRevenue: true;
    employeeCnt: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

/**
 * 사용자가 지원한 회사 정보를 조회하는 API
 */
const getCompanyApplication = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    // 사용자가 지원한 회사의 ID 목록 조회
    const appliedCompanies: AppliedCompany[] =
      await prisma.userApplications.findMany({
        where: { userId },
        select: { companyId: true },
      });

    const companyIds = appliedCompanies.map((app) => app.companyId);

    // 지원한 회사가 없는 경우 조기 반환
    if (companyIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "지원한 회사가 없습니다.",
        data: { companies: [] },
      });
    }

    // 조회한 회사 ID를 기반으로 회사 상세 정보 가져오기
    const companyDetails: CompanyDetails[] = await prisma.companies.findMany({
      where: {
        id: { in: companyIds },
      },
      select: {
        id: true,
        name: true,
        image: true,
        content: true,
        salesRevenue: true,
        employeeCnt: true,
        createdAt: true,
        updatedAt: true,
      },
      skip: offset, // 페이지네이션을 위한 offset
      take: limit, // 페이지네이션을 위한 limit
    });

    // 전체 페이지 수 계산
    const totalCount = await prisma.companies.count({
      where: {
        id: { in: companyIds },
      },
    });
    const totalPages = Math.ceil(totalCount / limit);

    // 결과 반환
    return res.status(200).json({
      success: true,
      message: "지원한 회사 목록 조회 성공",
      data: {
        companies: companyDetails,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    const { status, message } = handleError(error);
    res.status(status).json({ message });
  }
};

export default getCompanyApplication;
