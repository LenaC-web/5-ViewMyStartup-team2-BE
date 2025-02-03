import { prisma } from "../../prismaClient";
import { Request, Response } from "express";
import { ParsedQs } from "qs";

interface QueryType {
  page?: string;
  limit?: string;
  keyword?: string;
}

// 전체 상품 목록 조회
const getCompanyList = async (
  req: Request<{}, {}, {}, QueryType & ParsedQs>,
  res: Response
) => {
  try {
    //페이지네이션
    const page = Number(req.query.page) || 1; //(기본값: 1)
    const limit = Number(req.query.limit) || 100; //(기본값: 100);
    const skip = (page - 1) * limit; //페이지네이션을 위한 skip값 계산

    //정렬
    // const sort = req.query.sort || "recent"; //(기본값: 최신순)
    // const sortOption =
    //   sort === "favorite"
    //     ? { favoritesCount: "desc" } //좋아요순
    //     : { createdAt: sort === "recent" ? "desc" : "asc" };

    //키워드 검색
    // const keyword = req.query.keyword || ""; //(기본값: 빈 문자열)

    //name, description, tags 키워드 검색 조건
    // const searchCriteria = {
    //   AND: [
    //     {
    //       OR: [
    //         { name: { contains: keyword, mode: "insensitive" } },
    //         { content: { contains: keyword, mode: "insensitive" } }, //insensitive: 대소문자 구문x 검색
    //         {
    //           category: {
    //             some: { category: { contains: keyword, mode: "insensitive" } },
    //           }, //some: 배열 안에 조건 만족하는 최소 하나의 요소가 있는지
    //         },
    //       ],
    //     },
    //     { deletedAt: null }, //삭제 기록이 없는 데이터만 가져오기
    //   ],
    // };

    //products collection에서 키워드 검색 - 정렬 - skip값 만큼 항목을 건너뛰어 limit개수 만큼 데이터 불러오기(deletedAt 컬럼 제외)
    const companies = await prisma.companies.findMany({
      // where: searchCriteria,
      // orderBy: sortOption,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        image: true,
        content: true,
        salesRevenue: true,
        employeeCnt: true,
        category: true, //연결된 외부 테이블 데이터도 include말고 select로 가져옴
        createdAt: true,
        updatedAt: true,
      },
    });

    // console.log(companies);

    //총 상품 수, 페이지 수 계산
    //검색 키워드에 맞는 전체 데이터 개수 불러오기
    // const totalProducts = await prisma.companies.count({
    //   where: searchCriteria,
    // });
    // const totalPages = Math.ceil(totalProducts / limit);

    //요청 성공 시 응답 객체
    // const response = {
    //   status: 200,
    //   ProductList: products, //필터링된 상품 목록
    //   totalProducts,
    //   totalPages,
    //   page,
    //   limit,
    //   sort,
    //   keyword,
    // };

    const formattedCompanies = companies.map((company) => ({
      ...company,
      salesRevenue: company.salesRevenue.toString(), // BigInt 필드를 문자열로 변환
    }));

    res.status(200).send(formattedCompanies);
  } catch (e) {
    console.log("err:", e);
    res.status(500).send({ message: "서버 에러입니다." });
  }
};

export default getCompanyList;
