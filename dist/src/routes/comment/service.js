"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prismaClient_1 = require("../../prismaClient");
const getCompaniesCommentList = async (req, res) => {
    try {
        const comments = await prismaClient_1.prisma.companiesComments.findMany({
            where: {
                deletedAt: null,
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                user: true,
                company: true,
            },
        });
        return res.status(200).json(comments);
    }
    catch (error) {
        console.error("Error message in getCompaniesCommentList", error);
        return res.status(500).json({ error: "코멘트 목록 조회 실패" });
    }
};
const getCompaniesCommentListById = async (req, res) => {
    try {
        const { companyId } = req.params;
        if (!companyId) {
            return res.status(400).json({ error: "회사 ID가 필요합니다" });
        }
        const comments = await prismaClient_1.prisma.companiesComments.findMany({
            where: {
                companyId,
                deletedAt: null,
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                user: true,
                company: true,
            },
        });
        return res.status(200).json(comments);
    }
    catch (error) {
        console.error("Error message in getCompaniesCommentListById", error);
        return res.status(500).json({ error: "코멘트 목록 조회 실패" });
    }
};
const createCompaniesComment = async (req, res) => {
    try {
        const { userId, companyId, content } = req.body;
        const newComment = await prismaClient_1.prisma.companiesComments.create({
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
    }
    catch (error) {
        console.error("Error message in createCompaniesComment", error);
        return res.status(500).json({ error: "코멘트 생성 실패" });
    }
};
const updateCompaniesComment = async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    try {
        const updatedComment = await prismaClient_1.prisma.companiesComments.update({
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
    }
    catch (error) {
        console.error("Error message in updateCompaniesComment", error);
        return res.status(500).json({ error: "코멘트 수정 실패" });
    }
};
const deleteCompaniesComment = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedComment = await prismaClient_1.prisma.companiesComments.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });
        return res.status(200).json({ message: "코멘트 삭제 성공" });
    }
    catch (error) {
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
exports.default = commentService;
//# sourceMappingURL=service.js.map