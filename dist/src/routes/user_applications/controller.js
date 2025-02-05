"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const testUserMiddleware_1 = __importDefault(require("../middleware/testUserMiddleware"));
const getApplicationList_1 = __importDefault(require("./getApplicationList"));
const router = express_1.default.Router();
router.get("/", testUserMiddleware_1.default, getApplicationList_1.default);
exports.default = router;
//# sourceMappingURL=controller.js.map