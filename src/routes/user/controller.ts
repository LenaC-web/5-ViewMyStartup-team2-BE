import express from "express";
import service from "./service";

const router = express.Router();

// 사용자 관련 엔드포인트
router.post("/register", service.getBookmarks);
router.post("/login", service.getBookmarks);
router.get("/profile/:id", service.getBookmarks);
router.patch("/profile/:id", service.getBookmarks);
router.delete("/:id", service.getBookmarks);

export default router;
