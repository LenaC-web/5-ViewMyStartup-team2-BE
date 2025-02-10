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
    const page = parseInt(req.query.page?.toString() ?? "1") || 1; // undefined 또는 null이면 "1", parseInt 실패하면 1
    const limit = parseInt(req.query.limit?.toString() ?? "5") || 5; // undefined 또는 null이면 "5", parseInt 실패하면 5
    const offset = (page - 1) * limit;

    // 사용자가 지원한 회사의 ID 목록 조회
    const appliedCompanies = await prisma.userApplications.findMany({
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

    // 2. 각 회사별 지원자 수 집계
    const applicantCounts = await prisma.userApplications.groupBy({
      by: ["companyId"],
      where: { companyId: { in: companyIds } },
      _count: { companyId: true },
    });

    // 회사ID-지원자수 맵 생성
    const applicantCountMap = new Map(
      applicantCounts.map((ac) => [ac.companyId, ac._count.companyId])
    );

    // 3. 회사 상세 정보 조회 (페이지네이션 적용)
    const companies = await prisma.companies.findMany({
      where: { id: { in: companyIds } },
      include: { category: true }, // 카테고리 정보 포함
      orderBy: { createdAt: "desc" }, // 최신순 정렬
      skip: offset,
      take: limit,
    });

    // 5. 페이지네이션 메타데이터 계산
    const totalItems = companyIds.length; // 전체 지원 회사 수
    const totalPages = Math.ceil(totalItems / limit);

    // 4. 응답 데이터 포맷팅
    const formattedCompanies = companies.map((company) => ({
      id: company.id,
      name: company.name,
      image: company.image,
      content: company.content,
      employeeCnt: company.employeeCnt,
      salesRevenue: company.salesRevenue.toString(), // BigInt 처리
      categories: company.category.map((c) => c.category), // 카테고리명 배열
      applicantCount: applicantCountMap.get(company.id) || 0, // 지원자 수
    }));

    return res.status(200).json({
      success: true,
      message: "지원한 회사 목록 조회 성공",
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

    // 각 회사별 지원자 수 조회
    const companyIds = companies.map((company) => company.id);
    const applicantCounts = await prisma.userApplications.groupBy({
      by: ["companyId"],
      where: { companyId: { in: companyIds } },
      _count: { companyId: true },
    });

    // 회사ID-지원자수 맵 생성
    const applicantCountMap = new Map(
      applicantCounts.map((ac) => [ac.companyId, ac._count.companyId])
    );

    // 응답 데이터 포맷팅
    const formattedCompanies = companies.map((company) => ({
      id: company.id,
      name: company.name,
      image: company.image,
      content: company.content,
      employeeCnt: company.employeeCnt,
      salesRevenue: company.salesRevenue.toString(), // BigInt 처리
      categories: company.category.map((c) => c.category),
      applicantCount: applicantCountMap.get(company.id) || 0,
    }));

    const totalPages = Math.ceil(totalItems / limit);

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
