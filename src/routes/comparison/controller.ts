import express from "express";
import companyService from "./service";
import testUserMiddleware from "../middleware/testUserMiddleware";
import ComparisonList from "../comparison/getComparison";

const router = express.Router();

// 회사 관련 엔드포인트
router.get("/", companyService.getCompanies); // 회사 목록 조회
router.get("/:id", companyService.getCompany); // 회사 상세 조회
router.post("/", companyService.createCompany); // 회사 생성
router.patch("/:id", companyService.updateCompany); // 회사 정보 수정
router.delete("/:id", companyService.deleteCompany); // 회사 삭제
router.get("/pick", testUserMiddleware, ComparisonList.getCompanyApplication); // 지원한 회사 정보들
router.get("/search", testUserMiddleware, ComparisonList.getSearchCompany); // 검색한 회사 정보들

export default router;
