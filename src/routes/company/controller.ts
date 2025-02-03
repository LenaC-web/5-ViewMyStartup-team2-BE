import express from "express";
import service from "./service";

const router = express.Router();

// 회사 관련 엔드포인트
router.get("/", service.getBookmarks); // 회사 목록 조회
router.get("/:id", service.getBookmarks); // 회사 상세 조회
router.post("/", service.getBookmarks); // 회사 생성
router.patch("/:id", service.getBookmarks); // 회사 정보 수정
router.delete("/:id", service.getBookmarks); // 회사 삭제

export default router;
