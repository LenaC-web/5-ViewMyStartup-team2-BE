import express from "express";
import service from "./service.tsx";

const router = express.Router();

// 카테고리 관련 엔드포인트
router.get("/", service.getCategories); // 카테고리 목록 조회
router.post("/", service.createCategory); // 카테고리 생성
router.patch("/:id", service.updateCategory); // 카테고리 수정
router.delete("/:id", service.deleteCategory); // 카테고리 삭제

export default router;
