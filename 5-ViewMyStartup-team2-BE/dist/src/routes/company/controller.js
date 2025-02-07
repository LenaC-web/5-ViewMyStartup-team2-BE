"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const service_1 = __importDefault(require("./service"));
const router = express_1.default.Router();
router.get("/", service_1.default.getCompanies);
router.get("/:id", service_1.default.getCompany);
router.post("/", service_1.default.createCompany);
router.patch("/:id", service_1.default.updateCompany);
router.delete("/:id", service_1.default.deleteCompany);
exports.default = router;
//# sourceMappingURL=controller.js.map