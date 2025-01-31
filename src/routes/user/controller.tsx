import express from "express";
import service from "./service.tsx";

const router = express.Router();

// 사용자 관련 엔드포인트
router.post("/register", service.register);
router.post("/login", service.login);
router.get("/profile/:id", service.getProfile);
router.patch("/profile/:id", service.updateProfile);
router.delete("/:id", service.deleteUser);

export default router;
