import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/user/controller.js";
import companyRoutes from "./routes/company/controller.js";
import bookmarkRoutes from "./routes/bookmark/controller.js";
import categoryRoutes from "./routes/category/controller.js";
import commentRoutes from "./routes/comment/controller.js";
import userApplicationRoutes from "./routes/user_applications/controller.js";

const app = express();

// 데이터베이스 연결
connectDB();

// 기본 미들웨어
app.use(cors());
app.use(express.json());

// 기본 라우트 구조
app.use("/api/users", userRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/applications", userApplicationRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행중입니다`);
});

export default app;
