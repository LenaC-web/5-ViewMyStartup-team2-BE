"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prismaClient_1 = require("../../prismaClient");
const getMainCompanyList = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const filter = req.query.filter || "revenueDesc";
        const search = req.query.search || "";
        console.log("Query parameters:", { page, limit, skip, filter, search });
        let orderBy = {};
        switch (filter) {
            case "revenueDesc":
                orderBy = { salesRevenue: "desc" };
                break;
            case "revenueAsc":
                orderBy = { salesRevenue: "asc" };
                break;
            case "employeeDesc":
                orderBy = { employeeCnt: "desc" };
                break;
            case "employeeAsc":
                orderBy = { employeeCnt: "asc" };
                break;
            default:
                orderBy = { salesRevenue: "desc" };
        }
        const companies = await prismaClient_1.prisma.companies.findMany({
            where: {
                deletedAt: null,
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        content: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        category: {
                            some: {
                                category: {
                                    contains: search,
                                    mode: "insensitive",
                                },
                            },
                        },
                    },
                ],
            },
            orderBy,
            skip,
            take: limit,
            select: {
                id: true,
                idx: true,
                name: true,
                image: true,
                content: true,
                category: {
                    select: {
                        id: true,
                        category: true,
                    },
                },
                salesRevenue: true,
                employeeCnt: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        console.log("Found companies:", companies);
        const companyIds = companies.map((company) => company.id);
        const applicantCounts = await prismaClient_1.prisma.userApplications.groupBy({
            by: ["companyId"],
            where: { companyId: { in: companyIds } },
            _count: { companyId: true },
        });
        const applicantCountMap = Object.fromEntries(applicantCounts.map((app) => [app.companyId, app._count.companyId]));
        const formattedCompanies = companies.map((company) => ({
            id: company.id,
            idx: String(company.idx),
            name: company.name,
            image: company.image || undefined,
            content: company.content,
            category: company.category,
            salesRevenue: BigInt(company.salesRevenue).toString(),
            employeeCnt: company.employeeCnt,
            applicantCnt: applicantCountMap[company.id] || 0,
            createdAt: company.createdAt.toISOString(),
            updatedAt: company.updatedAt.toISOString(),
        }));
        const totalCompanies = await prismaClient_1.prisma.companies.count({
            where: {
                deletedAt: null,
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        content: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        category: {
                            some: {
                                category: {
                                    contains: search,
                                    mode: "insensitive",
                                },
                            },
                        },
                    },
                ],
            },
        });
        const totalPages = Math.ceil(totalCompanies / limit);
        const response = {
            companies: formattedCompanies,
            page,
            totalPages,
        };
        res.status(200).json(response);
    }
    catch (e) {
        console.log("err:", e);
        res.status(500).send({ message: "서버 에러입니다." });
    }
};
exports.default = getMainCompanyList;
//# sourceMappingURL=service.js.map