"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prismaClient_1 = require("../../prismaClient");
const getCompanies = async (req, res) => {
    try {
        const companies = await prismaClient_1.prisma.companies.findMany({
            where: {
                deletedAt: null,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        const formattedCompanies = companies.map((company) => ({
            ...company,
            salesRevenue: company.salesRevenue
                ? company.salesRevenue.toString()
                : "0",
        }));
        res.status(200).json(formattedCompanies);
    }
    catch (err) {
        console.error("Error message in getCompanies", err);
        res.status(500).json({ message: "기업 목록 조회 실패" });
    }
};
const getCompany = async (req, res) => {
    const { id } = req.params;
    try {
        const company = await prismaClient_1.prisma.companies.findUnique({
            where: {
                id,
                deletedAt: null,
            },
        });
        if (!company) {
            return res.status(404).json({ message: "해당 기업을 찾을 수 없습니다." });
        }
        const formattedCompany = {
            ...company,
            salesRevenue: company.salesRevenue
                ? company.salesRevenue.toString()
                : "0",
        };
        res.status(200).json(formattedCompany);
    }
    catch (err) {
        console.error("Error message in getCompany", err);
        res.status(500).json({ message: "기업 상세 조회 실패" });
    }
};
const createCompany = async (req, res) => {
    const { name, image, content, salesRevenue, employeeCnt } = req.body;
    try {
        const newCompany = await prismaClient_1.prisma.companies.create({
            data: {
                name,
                image,
                content,
                salesRevenue,
                employeeCnt,
            },
        });
        const companyWithStringBigInt = {
            ...newCompany,
            salesRevenue: newCompany.salesRevenue.toString(),
        };
        res.status(201).json(companyWithStringBigInt);
    }
    catch (err) {
        console.error("Error message in createCompany", err);
        res.status(500).json({ message: "기업 생성 실패" });
    }
};
const updateCompany = async (req, res) => {
    const { id } = req.params;
    const { name, image, content, salesRevenue, employeeCnt } = req.body;
    try {
        const updatedCompany = await prismaClient_1.prisma.companies.update({
            where: { id },
            data: {
                name,
                image,
                content,
                salesRevenue,
                employeeCnt,
            },
        });
        const formattedCompany = {
            ...updatedCompany,
            salesRevenue: updatedCompany.salesRevenue.toString(),
        };
        res.status(200).json(formattedCompany);
    }
    catch (err) {
        console.error("Error message in updateCompany", err);
        res.status(500).json({ message: "기업 수정 실패" });
    }
};
const deleteCompany = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCompany = await prismaClient_1.prisma.companies.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });
        const formattedDeletedCompany = {
            ...deletedCompany,
            salesRevenue: deletedCompany.salesRevenue.toString(),
            employeeCnt: deletedCompany.employeeCnt.toString(),
        };
        res.status(200).json(formattedDeletedCompany);
    }
    catch (err) {
        console.error("Error message in deleteCompany", err);
        res.status(500).json({ message: "기업 삭제 실패" });
    }
};
const companyService = {
    getCompanies,
    getCompany,
    createCompany,
    updateCompany,
    deleteCompany,
};
exports.default = companyService;
//# sourceMappingURL=service.js.map