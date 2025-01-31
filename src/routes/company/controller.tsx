import express from "express";
import service from "./service.tsx";

const router = express.Router();

// 회사 관련 엔드포인트
router.get("/", service.getCompanies); // 회사 목록 조회
router.get("/:id", service.getCompany); // 회사 상세 조회
router.post("/", service.createCompany); // 회사 생성
router.patch("/:id", service.updateCompany); // 회사 정보 수정
router.delete("/:id", service.deleteCompany); // 회사 삭제

export default router;
