import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

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
        url: "http://localhost:3000",
        description: "로컬 서버",
      },
    ],
    tags: [
      {
        name: "Users",
        description: "사용자 관련 API",
      },
    ],
  },
  apis: ["./src/routes/**/*.ts"], // Swagger 주석이 포함된 파일 경로
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Express) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
