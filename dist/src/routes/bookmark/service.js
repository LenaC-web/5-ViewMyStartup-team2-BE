"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prismaClient_1 = require("../../prismaClient");
const getBookmarks = async (req, res) => {
    const { userId } = req.params;
    try {
        const bookmarks = await prismaClient_1.prisma.bookmark.findMany({
            where: {
                userId,
                deletedAt: null,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.status(200).json(bookmarks);
    }
    catch (err) {
        console.error("Error message in getBookmarks", err);
        res.status(500).json({ message: "즐겨찾기 조회 실패" });
    }
};
const createBookmark = async (req, res) => {
    const { userId, companyId } = req.body;
    try {
        const existingBookmark = await prismaClient_1.prisma.bookmark.findFirst({
            where: {
                userId: userId,
                companyId: companyId,
                deletedAt: null,
            },
        });
        if (existingBookmark) {
            return res
                .status(400)
                .json({ message: "이 기업은 이미 즐겨찾기로 등록되어 있습니다." });
        }
        const newBookmark = await prismaClient_1.prisma.bookmark.create({
            data: {
                userId,
                companyId,
            },
        });
        res.status(201).json(newBookmark);
    }
    catch (err) {
        console.error("Error message in createBookmark", err);
        res.status(500).json({ message: "즐겨찾기 추가 실패" });
    }
};
const deleteBookmark = async (req, res) => {
    const { userId, companyId } = req.body;
    try {
        const bookmark = await prismaClient_1.prisma.bookmark.findFirst({
            where: {
                userId: userId,
                companyId: companyId,
                deletedAt: null,
            },
        });
        if (!bookmark) {
            return res
                .status(404)
                .json({ message: "해당 즐겨찾기를 찾을 수 없습니다." });
        }
        const deletedBookmark = await prismaClient_1.prisma.bookmark.update({
            where: {
                id: bookmark.id,
            },
            data: {
                deletedAt: new Date(),
            },
        });
        res.status(200).json(deletedBookmark);
    }
    catch (err) {
        console.error("Error message in deleteBookmark", err);
        res.status(500).json({ message: "즐겨찾기 삭제 실패" });
    }
};
const bookmarkService = {
    getBookmarks,
    createBookmark,
    deleteBookmark,
};
exports.default = bookmarkService;
//# sourceMappingURL=service.js.map