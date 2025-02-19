import express from "express";
import ComparisonList from "../comparison/getComparison";

const router = express.Router();

// 회사 관련 엔드포인트
router.get("/pick/:userId", ComparisonList.getCompanyApplication); // 지원한 회사 정보들
router.get("/search", ComparisonList.getSearchCompany); // 검색한 회사 정보들

export default router;
