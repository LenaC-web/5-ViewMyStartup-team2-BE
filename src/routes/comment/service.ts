import { prisma } from "../../prismaClient";
import { Request, Response } from "express";

// 코멘트 목록 조회
const getCompaniesCommentList = async (req: Request, res: Response) => {
  try {
    const comments = await prisma.companiesComments.findMany({
      where: {
        deletedAt: null, // 삭제되지 않은 코멘트만 조회
      },
      orderBy: {
        createdAt: "desc", // 최신 생성순 정렬
      },
      include: {
        user: true, // 사용자 정보 포함
        company: true, // 회사 정보 포함
      },
    });
    return res.status(200).json(comments);
  } catch (error) {
    console.error("Error message in getCompaniesCommentList", error);
    return res.status(500).json({ error: "코멘트 목록 조회 실패" });
  }
};

// 코멘트 목록 조회 by ID
const getCompaniesCommentListById = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params; // URL에서 route parameter로 받기 (예: /companies/123/comments)

    if (!companyId) {
      return res.status(400).json({ error: "회사 ID가 필요합니다" });
    }

    const comments = await prisma.companiesComments.findMany({
      where: {
        companyId,
        deletedAt: null, // 삭제되지 않은 코멘트만 조회
      },
      orderBy: {
        createdAt: "desc", // 최신 생성순 정렬
      },
      include: {
        user: true, // 사용자 정보 포함
        company: true, // 회사 정보 포함
      },
    });
    return res.status(200).json(comments);
  } catch (error) {
    console.error("Error message in getCompaniesCommentListById", error);
    return res.status(500).json({ error: "코멘트 목록 조회 실패" });
  }
};

// 코멘트 생성
const createCompaniesComment = async (req: Request, res: Response) => {
  try {
    const { userId, companyId, content } = req.body;
    const newComment = await prisma.companiesComments.create({
      data: {
        userId,
        companyId,
        content,
      },
      include: {
        user: true,
        company: true,
      },
    });
    return res.status(201).json(newComment);
  } catch (error) {
    console.error("Error message in createCompaniesComment", error);
    return res.status(500).json({ error: "코멘트 생성 실패" });
  }
};

// 코멘트 수정
const updateCompaniesComment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;
  try {
    const updatedComment = await prisma.companiesComments.update({
      where: { id },
      data: {
        content,
        updatedAt: new Date(),
      },
      include: {
        user: true,
        company: true,
      },
    });
    return res.status(200).json(updatedComment);
  } catch (error) {
    console.error("Error message in updateCompaniesComment", error);
    return res.status(500).json({ error: "코멘트 수정 실패" });
  }
};

// 코멘트 삭제
const deleteCompaniesComment = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deletedComment = await prisma.companiesComments.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
    return res.status(200).json({ message: "코멘트 삭제 성공" });
  } catch (error) {
    console.error("Error message in deleteCompaniesComment", error);
    return res.status(500).json({ error: "코멘트 삭제 실패" });
  }
};

const commentService = {
  getCompaniesCommentList,
  getCompaniesCommentListById,
  createCompaniesComment,
  updateCompaniesComment,
  deleteCompaniesComment,
};

export default commentService;
