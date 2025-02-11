import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const isProd = process.env.NODE_ENV === "production"; // 환경 변수 확인
const SERVER_URL = isProd
  ? process.env.PROD_SERVER_URL || "https://api.example.com" // 배포 환경
  : process.env.DEV_SERVER_URL || "http://localhost:3000"; // 개발 환경

const options: swaggerJSDoc.Options = {
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
  apis: [isProd ? "./dist/routes/**/*.js" : "./src/routes/**/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Express) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
