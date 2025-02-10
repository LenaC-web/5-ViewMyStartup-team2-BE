import { Prisma } from "@prisma/client";
import { prisma } from "../../prismaClient";
import { Request, Response } from "express";
import { handleError } from "../err/errHandler";

/* 지원한 회사 목록 조회
http://localhost:3000/api/comparison/pick?page=1
*/
const getCompanyApplication = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const page = Math.max(parseInt(req.query.page?.toString() ?? "1"), 1);
    const limit = Math.max(parseInt(req.query.limit?.toString() ?? "5"), 1);
    const offset = (page - 1) * limit;

    // 사용자가 지원한 회사 ID 조회
    const appliedCompanies = await prisma.userApplications.findMany({
      where: { userId },
      select: { companyId: true },
    });

    const companyIds = [
      ...new Set(appliedCompanies.map((app) => app.companyId)),
    ];

    if (companyIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "지원한 회사가 없습니다.",
        data: { companies: [], pagination: {} },
      });
    }

    // 전체 회사 조회
    const allCompanies = await prisma.companies.findMany({
      include: { category: true },
    });

    // 전체 회사에 대한 랭킹 정보 매핑
    const rankMaps = {
      applicant: new Map<string, number>(),
      salesRevenue: new Map<string, number>(),
      employee: new Map<string, number>(),
    };

    // 지원자 수에 따른 랭킹 매핑
    const applicantCounts = await prisma.userApplications.groupBy({
      by: ["companyId"],
      _count: { companyId: true },
    });

    const userApplicationCountMap = new Map(
      applicantCounts.map((uc) => [uc.companyId, uc._count.companyId])
    );

    allCompanies
      .slice()
      .sort(
        (a, b) =>
          (userApplicationCountMap.get(b.id) || 0) -
          (userApplicationCountMap.get(a.id) || 0)
      )
      .forEach((company, index) => {
        rankMaps.applicant.set(company.id, index + 1);
      });

    // 매출에 따른 랭킹 매핑
    allCompanies
      .slice()
      .sort((a, b) => Number(b.salesRevenue) - Number(a.salesRevenue))
      .forEach((company, index) => {
        rankMaps.salesRevenue.set(company.id, index + 1);
      });

    // 직원 수에 따른 랭킹 매핑
    allCompanies
      .slice()
      .sort((a, b) => b.employeeCnt - a.employeeCnt)
      .forEach((company, index) => {
        rankMaps.employee.set(company.id, index + 1);
      });

    // 지원자 수 및 랭킹 정보 조회
    const [applicantCountsForUser, rankedCompanies] = await Promise.all([
      prisma.userApplications.groupBy({
        by: ["companyId"],
        where: { companyId: { in: companyIds } },
        _count: { companyId: true },
      }),
      prisma.companies.findMany({
        where: { id: { in: companyIds } },
        include: {
          category: true,
        },
      }),
    ]);

    const userApplicationCountMapForUser = new Map(
      applicantCountsForUser.map((uc) => [uc.companyId, uc._count.companyId])
    );

    // 페이지네이션 적용
    const paginatedCompanies = rankedCompanies.slice(offset, offset + limit);

    // 응답 데이터 생성
    const formattedCompanies = paginatedCompanies.map((company) => ({
      id: company.id,
      name: company.name,
      image: company.image,
      content: company.content,
      employeeCnt: company.employeeCnt,
      salesRevenue: company.salesRevenue.toString(),
      categories: company.category.map((c) => c.category),
      applicantCount: userApplicationCountMapForUser.get(company.id) || 0,
      applicantRank: rankMaps.applicant.get(company.id) || null,
      salesRevenueRank: rankMaps.salesRevenue.get(company.id) || null,
      employeeRank: rankMaps.employee.get(company.id) || null,
    }));

    // 페이지네이션
    const totalItems = companyIds.length;
    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      success: true,
      message: "지원한 회사 목록 조회 성공",
      data: {
        companies: formattedCompanies,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    const { status, message } = handleError(error);
    res.status(status).json({ message });
  }
};

/* 검색한 회사 목록 조회
GET http://localhost:3000/api/comparison/search?page=1&&keyword=펀더풀
*/
const getSearchCompany = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const keyword = req.query.keyword?.toString() ?? "";
    const page = parseInt(req.query.page?.toString() ?? "1") || 1;
    const limit = parseInt(req.query.limit?.toString() ?? "5") || 5;
    const offset = (page - 1) * limit;

    // 검색 조건 설정 (키워드 검색이 있을 경우 적용)
    const where: Prisma.CompaniesWhereInput = keyword
      ? { name: { contains: keyword, mode: "insensitive" } }
      : {};

    // 전체 회사 조회
    const allCompanies = await prisma.companies.findMany({
      include: { category: true },
    });

    // 전체 회사에 대한 랭킹 정보 매핑
    const rankMaps = {
      applicant: new Map<string, number>(),
      revenue: new Map<string, number>(),
      employee: new Map<string, number>(),
    };

    // 지원자 수에 따른 랭킹 매핑
    const applicantCounts = await prisma.userApplications.groupBy({
      by: ["companyId"],
      _count: { companyId: true },
    });

    const userApplicationCountMap = new Map(
      applicantCounts.map((uc) => [uc.companyId, uc._count.companyId])
    );

    allCompanies
      .slice()
      .sort(
        (a, b) =>
          (userApplicationCountMap.get(b.id) || 0) -
          (userApplicationCountMap.get(a.id) || 0)
      )
      .forEach((company, index) => {
        rankMaps.applicant.set(company.id, index + 1);
      });

    // 매출에 따른 랭킹 매핑
    allCompanies
      .slice()
      .sort((a, b) => Number(b.salesRevenue) - Number(a.salesRevenue))
      .forEach((company, index) => {
        rankMaps.revenue.set(company.id, index + 1);
      });

    // 직원 수에 따른 랭킹 매핑
    allCompanies
      .slice()
      .sort((a, b) => b.employeeCnt - a.employeeCnt)
      .forEach((company, index) => {
        rankMaps.employee.set(company.id, index + 1);
      });

    // 병렬 쿼리 실행
    const [totalItems, companies] = await Promise.all([
      prisma.companies.count({ where }),
      prisma.companies.findMany({
        where,
        skip: offset,
        take: limit,
        include: { category: true },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    // 응답 데이터 포맷팅
    const formattedCompanies = companies.map((company) => ({
      id: company.id,
      name: company.name,
      image: company.image,
      content: company.content,
      employeeCnt: company.employeeCnt,
      salesRevenue: company.salesRevenue.toString(), // BigInt 처리
      categories: company.category.map((c) => c.category),
      applicantCount: userApplicationCountMap.get(company.id) || 0,
      applicantRank: rankMaps.applicant.get(company.id) || null,
      revenueRank: rankMaps.revenue.get(company.id) || null,
      employeeRank: rankMaps.employee.get(company.id) || null,
    }));

    return res.status(200).json({
      success: true,
      message: "검색한 회사 목록 조회 성공",
      data: {
        companies: formattedCompanies,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
        },
      },
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
