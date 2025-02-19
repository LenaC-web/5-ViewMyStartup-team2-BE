import express from "express";
import companyDetailService from "./service";

const router = express.Router();

// 기업 상세 관련 엔드포인트
router.get("/:id", companyDetailService.getCompanyDetail); // 기업 상세 조회

export default router;
