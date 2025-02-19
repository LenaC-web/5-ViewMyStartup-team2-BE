import { Request, Response } from "express";
declare const applyService: {
    applyForCompany: (req: Request, res: Response) => Promise<void>;
};
export default applyService;
