"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const service_1 = __importDefault(require("./service"));
const router = express_1.default.Router();
// 기업 상세 관련 엔드포인트
router.get("/:id", service_1.default.getCompanyDetail); // 기업 상세 조회
exports.default = router;
//# sourceMappingURL=controller.js.map