"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prismaClient_1 = require("../../prismaClient");
const testUserMiddleware = async (req, res, next) => {
    try {
        const testUserId = "d292ec89-4228-47de-8fc4-bcc18003a34c";
        const user = await prismaClient_1.prisma.users.findUnique({
            where: { id: testUserId },
        });
        if (!user) {
            return res
                .status(404)
                .json({ message: "테스트 사용자를 찾을 수 없습니다." });
        }
        req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
        };
        next();
    }
    catch (error) {
        console.error("Test User Middleware Error:", error);
        res.status(500).json({ message: "서버 에러입니다." });
    }
};
exports.default = testUserMiddleware;
//# sourceMappingURL=testUserMiddleware.js.map