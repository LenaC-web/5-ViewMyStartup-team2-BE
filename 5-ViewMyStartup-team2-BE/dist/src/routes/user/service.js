"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prismaClient_1 = require("../../prismaClient");
const getuserList = async (req, res) => {
    try {
        const users = await prismaClient_1.prisma.users.findMany({
            where: {
                deletedAt: null,
            },
        });
        return res.status(200).json(users);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: error });
    }
};
const createUser = async (req, res) => {
    try {
        const { email, password, name, nickname } = req.body;
        const newUser = await prismaClient_1.prisma.users.create({
            data: {
                email,
                password,
                name,
                nickname,
            },
        });
        return res.status(201).json(newUser);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "서버 오류" });
    }
};
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prismaClient_1.prisma.users.findUnique({
            where: {
                email,
            },
        });
        if (!user || user.password !== password) {
            return res.status(400).json({ error: "잘못된 이메일 또는 비밀번호" });
        }
        return res.status(200).json(user);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "서버 오류" });
    }
};
const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prismaClient_1.prisma.users.findUnique({
            where: {
                id,
            },
        });
        if (!user) {
            return res.status(404).json({ error: "사용자를 찾을 수 없습니다" });
        }
        return res.status(200).json(user);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "서버 오류" });
    }
};
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, password, name, nickname } = req.body;
        const updatedUser = await prismaClient_1.prisma.users.update({
            where: { id },
            data: {
                email,
                password,
                name,
                nickname,
            },
        });
        return res.status(200).json(updatedUser);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "서버 오류" });
    }
};
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await prismaClient_1.prisma.users.delete({
            where: {
                id,
            },
        });
        return res.status(200).json({ message: "사용자 삭제 성공" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "서버 오류" });
    }
};
const service = {
    getuserList,
    createUser,
    loginUser,
    getUser,
    updateUser,
    deleteUser,
};
exports.default = service;
//# sourceMappingURL=service.js.map