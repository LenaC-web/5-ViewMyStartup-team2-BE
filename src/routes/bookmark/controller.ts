import express from "express";
import bookmarkService from "./service";

const router = express.Router();

// 북마크 관련 엔드포인트
router.get("/", bookmarkService.getBookmarks); // 북마크 목록 조회
router.post("/", bookmarkService.createBookmark); // 북마크 생성
router.delete("/:id", bookmarkService.deleteBookmark); // 북마크 삭제

export default router;
