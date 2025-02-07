import express from "express";
import service from "./service";

const router = express.Router();

// 댓글 관련 엔드포인트
router.get("/", service.getBookmarks); // 댓글 목록 조회
router.post("/", service.getBookmarks); // 댓글 생성
router.patch("/:id", service.getBookmarks); // 댓글 수정
router.delete("/:id", service.getBookmarks); // 댓글 삭제

export default router;
