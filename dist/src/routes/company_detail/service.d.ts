import { Request, Response } from "express";
declare const companyDetailService: {
    getCompanyDetail: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
};
export default companyDetailService;
