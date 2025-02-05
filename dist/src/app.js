"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const controller_1 = __importDefault(require("./routes/user/controller"));
const controller_2 = __importDefault(require("./routes/company/controller"));
const controller_3 = __importDefault(require("./routes/bookmark/controller"));
const controller_4 = __importDefault(require("./routes/category/controller"));
const controller_5 = __importDefault(require("./routes/comment/controller"));
const controller_6 = __importDefault(require("./routes/user_applications/controller"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/users", controller_1.default);
app.use("/api/companies", controller_2.default);
app.use("/api/bookmarks", controller_3.default);
app.use("/api/categories", controller_4.default);
app.use("/api/comments", controller_5.default);
app.use("/api/applications", controller_6.default);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행중입니다`);
});
exports.default = app;
//# sourceMappingURL=app.js.map