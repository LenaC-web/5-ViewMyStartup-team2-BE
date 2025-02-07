import { Prisma } from "@prisma/client";
import { prisma } from "src/prismaClient";
import { Request, Response } from "express";
import { handleError } from "../err/errHandler";

type AppliedCompany = Prisma.UserApplicationsGetPayload<{
  select: { companyId: true };
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

interface CompanyWithApplicantCount extends CompanyDetails {
  applicantCount: number;
}

interface SearchQuery {
  keyword?: string;
  page?: string;
}

const getCompanyApplication = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1; // 기본값: 1
    const limit = parseInt(req.query.limit as string) || 5; // 기본값: 5
    const offset = (page - 1) * limit;

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

    // 지원자 수 집계
    const applicantCounts = await prisma.userApplications.groupBy({
      by: ["companyId"],
      where: { companyId: { in: companyIds } },
      _count: { companyId: true },
    });

    const applicantCountMap = new Map(
      applicantCounts.map((ac) => [ac.companyId, ac._count.companyId])
    );

    // 회사 정보 조회 (정렬 및 페이지네이션 적용)
    const companies = await prisma.companies.findMany({
      where: { id: { in: companyIds } },
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
      skip: offset,
      take: limit,
    });

    // 지원자 수 추가
    const companiesWithApplicantCount: CompanyWithApplicantCount[] =
      companies.map((company) => ({
        ...company,
        applicantCount: applicantCountMap.get(company.id) || 0,
      }));

    // 전체 페이지 수 계산
    const totalCount = companyIds.length;
    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      success: true,
      message: "지원한 회사 목록 조회 성공",
      data: {
        companies: companiesWithApplicantCount,
        pagination: {
          currentPage: page,
          totalPages,
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

const getSearchCompany = async (
  req: Request<{}, {}, {}, SearchQuery>,
  res: Response
) => {
  try {
    const { keyword: searchKeyword, page } = req.query;
    const pageNumber: number = page ? parseInt(page, 10) : 1;
    const take: number = 5;
    const skip: number = (pageNumber - 1) * take;

    // 검색어가 있으면 해당 조건을, 없으면 전체 조회 조건({})를 사용합니다.
    const whereClause = searchKeyword
      ? {
          name: {
            contains: searchKeyword,
            mode: "insensitive",
          },
        }
      : {};

    // 조건에 맞는 전체 레코드 수 계산
    const totalCount: number = await prisma.companies.count({
      where: whereClause,
    });

    // 조건과 skip, take 옵션을 이용하여 해당 페이지의 데이터를 가져옵니다.
    const companies = await prisma.companies.findMany({
      where: whereClause,
      skip: skip,
      take: take,
    });

    // 응답 객체에 현재 페이지, 총 페이지 수, 총 레코드 수와 데이터를 포함시킵니다.
    return res.json({
      data: companies,
      page: pageNumber,
      totalPages: Math.ceil(totalCount / take),
      totalCount,
    });
  } catch (error) {
    const { status, message } = handleError(error);
    res.status(status).json({ message });
  }
};

const ComparisonList = {
  getCompanyApplication,
  getSearchCompany,
};

export default ComparisonList;
