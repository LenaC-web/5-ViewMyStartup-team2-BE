"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const testUserMiddleware_1 = __importDefault(require("../middleware/testUserMiddleware"));
const getComparison_1 = __importDefault(require("../comparison/getComparison"));
const router = express_1.default.Router();
router.get("/pick", testUserMiddleware_1.default, getComparison_1.default.getCompanyApplication);
router.get("/search", testUserMiddleware_1.default, getComparison_1.default.getSearchCompany);
exports.default = router;
//# sourceMappingURL=controller.js.map