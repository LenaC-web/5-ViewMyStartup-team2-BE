import express from "express";
import service from "./service";

const router = express.Router();

// 북마크 관련 엔드포인트
router.get("/", service.getBookmarks); // 북마크 목록 조회
router.post("/", service.getBookmarks); // 북마크 생성
router.delete("/:id", service.getBookmarks); // 북마크 삭제

export default router;
