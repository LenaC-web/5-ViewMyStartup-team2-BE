"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const service_1 = __importDefault(require("./service"));
const router = express_1.default.Router();
router.get("/", service_1.default.getuserList);
router.get("/profile/:id", service_1.default.getUser);
router.post("/login", service_1.default.loginUser);
router.post("/register", service_1.default.createUser);
router.patch("/profile/:id", service_1.default.updateUser);
router.delete("/:id", service_1.default.deleteUser);
exports.default = router;
//# sourceMappingURL=controller.js.map