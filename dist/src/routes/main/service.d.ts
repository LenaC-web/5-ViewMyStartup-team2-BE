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
declare const getMainCompanyList: (req: Request<{}, {}, {}, QueryType>, res: Response<CompanyListResponse | ErrorResponse>) => Promise<void>;
export default getMainCompanyList;
