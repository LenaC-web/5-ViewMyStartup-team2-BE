import { Request, Response } from "express";
interface QueryType {
    page?: string;
    filter?: string;
    search?: string;
}
interface CompanyDTO {
    id: string;
    idx: string;
    name: string;
    image?: string;
    content: string;
    category: {
        id: string;
        category: string;
    }[];
    salesRevenue: string;
    employeeCnt: number;
    applicantCnt: number;
    createdAt: string;
    updatedAt: string;
}
interface CompanyListResponse {
    companies: CompanyDTO[];
    page: number;
    totalPages: number;
}
interface ErrorResponse {
    message: string;
    error?: string;
    stack?: string;
}
/**
 * 메인 페이지에 표시될 회사 목록을 조회하는 함수
 * @param req - Express Request 객체
 * @param res - Express Response 객체
 * @returns 회사 목록 또는 에러 응답
 */
declare const getMainCompanyList: (req: Request<{}, {}, {}, QueryType>, res: Response<CompanyListResponse | ErrorResponse>) => Promise<Response<CompanyListResponse | ErrorResponse, Record<string, any>>>;
export default getMainCompanyList;
