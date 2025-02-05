import { ApplicationStatus } from "@prisma/client";
import { Request, Response } from "express";
interface QueryType {
    page?: string;
    filter?: string;
}
interface ApplicationDTO {
    id?: string;
    name: string;
    image: string | null;
    content: string;
    category: {
        id: string;
        category: string;
    }[];
    status: ApplicationStatus | string;
    applicantCnt: number;
    createdAt?: Date;
    updatedAt?: Date;
}
interface ApplicationListResponse {
    applications: ApplicationDTO[];
    page: number;
    totalPages: number;
}
interface ErrorResponse {
    message: string;
}
declare const getApplicationList: (req: Request<{}, {}, {}, QueryType>, res: Response<ApplicationListResponse | ErrorResponse>) => Promise<Response<ApplicationListResponse | ErrorResponse, Record<string, any>>>;
export default getApplicationList;
