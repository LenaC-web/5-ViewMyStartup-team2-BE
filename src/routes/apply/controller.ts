import express from "express";
import applyService from "./service";

const router = express.Router();

// 지원 관련 엔드포인트
router.post("/:id", applyService.applyForCompany); // 지원서 제출

export default router;
