import { Request, Response } from "express";
import { prisma } from "../../prismaClient";

interface QueryType {
  page?: string; // 페이지 번호 (기본값: 1)
  filter?: string; // 정렬 기준 (revenueDesc: 매출액 높은순, revenueAsc: 매출액 낮은순)
}

interface CompanyDTO {
  id: string; // 회사 고유 ID
  idx: string; // 회사 인덱스 번호
  name: string; // 회사명
  image?: string; // 회사 로고 이미지 URL (선택적)
  content: string; // 회사 소개글
  category: {
    // 회사 카테고리 정보
    id: string; // 카테고리 ID
    category: string; // 카테고리명
  }[];
  salesRevenue: string; // 매출액 (BigInt를 문자열로 변환)
  employeeCnt: number; // 직원 수
  applicantCnt: number; // 지원자 수
  createdAt: string; // 생성일시
  updatedAt: string; // 수정일시
}

interface CompanyListResponse {
  companies: CompanyDTO[]; // 회사 목록
  page: number; // 현재 페이지 번호
  totalPages: number; // 전체 페이지 수
}

interface ErrorResponse {
  message: string; // 에러 메시지
  error?: string; // 에러 상세 메시지 (선택적)
  stack?: string; // 스택 트레이스 (선택적)
}

/**
 * 메인 페이지에 표시될 회사 목록을 조회하는 함수
 * @param req - Express Request 객체
 * @param res - Express Response 객체
 * @returns 회사 목록 또는 에러 응답
 */
const getMainCompanyList = async (
  req: Request<{}, {}, {}, QueryType>,
  res: Response<CompanyListResponse | ErrorResponse>
) => {
  try {
    // 1. 페이지네이션 파라미터 설정
    const page: number = Number(req.query.page) || 1;
    const limit: number = 10;
    const skip: number = (page - 1) * limit;
    const filter: string = req.query.filter || "revenueDesc";

    console.log("Query parameters:", { page, limit, skip, filter }); // 쿼리 파라미터 로깅

    // 2. 회사 목록 조회
    const companies = await prisma.companies.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        salesRevenue: filter === "revenueDesc" ? "desc" : "asc",
      },
      skip,
      take: limit,
      select: {
        id: true,
        idx: true,
        name: true,
        image: true,
        content: true,
        category: {
          select: {
            id: true,
            category: true,
          },
        },
        salesRevenue: true,
        employeeCnt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log("Found companies:", companies); // 조회된 회사 데이터 로깅

    // 3. 조회된 회사들의 ID 목록 추출
    const companyIds = companies.map((company) => company.id);

    // 4. 회사별 지원자 수 집계
    const applicantCounts = await prisma.userApplications.groupBy({
      by: ["companyId"],
      where: { companyId: { in: companyIds } },
      _count: { companyId: true },
    });

    // 5. 지원자 수 매핑 (회사ID -> 지원자수)
    const applicantCountMap = Object.fromEntries(
      applicantCounts.map((app) => [app.companyId, app._count.companyId])
    );

    // 6. 응답 데이터 형식에 맞게 가공
    const formattedCompanies = companies.map((company) => ({
      id: company.id,
      idx: String(company.idx),
      name: company.name,
      image: company.image || undefined,
      content: company.content,
      category: company.category,
      salesRevenue: BigInt(company.salesRevenue).toString(),
      employeeCnt: company.employeeCnt,
      applicantCnt: applicantCountMap[company.id] || 0, // 지원자 수 (없으면 0)
      createdAt: company.createdAt.toISOString(), // Date -> ISO 문자열 변환
      updatedAt: company.updatedAt.toISOString(),
    }));

    // 7. 전체 페이지 수 계산
    const totalCompanies = await prisma.companies.count({
      where: {
        deletedAt: null,
      },
    });
    const totalPages = Math.ceil(totalCompanies / limit);

    // 8. 최종 응답 데이터 구성
    const response: CompanyListResponse = {
      companies: formattedCompanies,
      page,
      totalPages,
    };

    res.status(200).json(response);
  } catch (e) {
    console.log("err:", e);
    res.status(500).send({ message: "서버 에러입니다." });
  }
};

export default getMainCompanyList;
