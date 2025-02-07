"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = setupSwagger;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const isProd = process.env.NODE_ENV === "production";
const SERVER_URL = isProd
    ? process.env.PROD_SERVER_URL || "https://api.example.com"
    : process.env.DEV_SERVER_URL || "http://localhost:3000";
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API 문서",
            version: "1.0.0",
            description: "사용자 및 기타 기능을 포함한 API 문서",
        },
        servers: [
            {
                url: SERVER_URL,
                description: isProd ? "배포 서버" : "개발 서버",
            },
        ],
        tags: [
            {
                name: "Users",
                description: "사용자 관련 API",
            },
            {
                name: "Applications",
                description: "사용자 지원 현황 관련 API",
            },
        ],
    },
    apis: ["./src/routes/**/*.ts"],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
function setupSwagger(app) {
    app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
}
//# sourceMappingURL=swagger.js.map