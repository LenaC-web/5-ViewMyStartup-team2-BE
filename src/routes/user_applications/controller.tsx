import express from "express";
import service from "./service.tsx";

const router = express.Router();

// 지원서 관련 엔드포인트
router.get("/", service.getApplications); // 지원서 목록 조회
router.post("/", service.createApplication); // 지원서 생성
router.patch("/:id", service.updateApplication); // 지원서 수정
router.delete("/:id", service.deleteApplication); // 지원서 삭제

export default router;
