"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prismaClient_1 = require("../../prismaClient");
const errHandler_1 = require("../err/errHandler");
const getCompanyApplication = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = Math.max(parseInt(req.query.page?.toString() ?? "1"), 1);
        const limit = Math.max(parseInt(req.query.limit?.toString() ?? "5"), 1);
        const offset = (page - 1) * limit;
        const keyword = req.query.keyword?.toString() ?? "";
        const appliedCompanies = await prismaClient_1.prisma.userApplications.findMany({
            where: { userId },
            select: { companyId: true },
        });
        const companyIds = [
            ...new Set(appliedCompanies.map((app) => app.companyId)),
        ];
        if (companyIds.length === 0) {
            return res.status(200).json({
                success: true,
                message: "지원한 회사가 없습니다.",
                data: { companies: [], pagination: {} },
            });
        }
        const allCompanies = await prismaClient_1.prisma.companies.findMany({
            include: { category: true },
        });
        const rankMaps = {
            applicant: new Map(),
            salesRevenue: new Map(),
            employee: new Map(),
        };
        const applicantCounts = await prismaClient_1.prisma.userApplications.groupBy({
            by: ["companyId"],
            _count: { companyId: true },
        });
        const userApplicationCountMap = new Map(applicantCounts.map((uc) => [uc.companyId, uc._count.companyId]));
        allCompanies
            .slice()
            .sort((a, b) => (userApplicationCountMap.get(b.id) || 0) -
            (userApplicationCountMap.get(a.id) || 0))
            .forEach((company, index) => {
            rankMaps.applicant.set(company.id, index + 1);
        });
        allCompanies
            .slice()
            .sort((a, b) => Number(b.salesRevenue) - Number(a.salesRevenue))
            .forEach((company, index) => {
            rankMaps.salesRevenue.set(company.id, index + 1);
        });
        allCompanies
            .slice()
            .sort((a, b) => b.employeeCnt - a.employeeCnt)
            .forEach((company, index) => {
            rankMaps.employee.set(company.id, index + 1);
        });
        const [applicantCountsForUser, appliedCompaniesDetails] = await Promise.all([
            prismaClient_1.prisma.userApplications.groupBy({
                by: ["companyId"],
                where: { companyId: { in: companyIds } },
                _count: { companyId: true },
            }),
            prismaClient_1.prisma.companies.findMany({
                where: { id: { in: companyIds } },
                include: { category: true },
            }),
        ]);
        const userApplicationCountMapForUser = new Map(applicantCountsForUser.map((uc) => [uc.companyId, uc._count.companyId]));
        const filteredAppliedCompanies = keyword
            ? appliedCompaniesDetails.filter((company) => company.name.toLowerCase().includes(keyword))
            : appliedCompaniesDetails;
        const paginatedCompanies = filteredAppliedCompanies.slice(offset, offset + limit);
        const formattedCompanies = paginatedCompanies.map((company) => ({
            id: company.id,
            name: company.name,
            image: company.image,
            content: company.content,
            employeeCnt: company.employeeCnt,
            salesRevenue: company.salesRevenue.toString(),
            categories: company.category.map((c) => c.category),
            applicantCount: userApplicationCountMapForUser.get(company.id) || 0,
            applicantRank: rankMaps.applicant.get(company.id) || null,
            salesRevenueRank: rankMaps.salesRevenue.get(company.id) || null,
            employeeRank: rankMaps.employee.get(company.id) || null,
        }));
        const totalItems = filteredAppliedCompanies.length;
        const totalPages = Math.ceil(totalItems / limit);
        return res.status(200).json({
            success: true,
            message: "지원한 회사 목록 조회 성공",
            data: {
                companies: formattedCompanies,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems,
                    itemsPerPage: limit,
                },
            },
        });
    }
    catch (error) {
        const { status, message } = (0, errHandler_1.handleError)(error);
        res.status(status).json({ message });
    }
};
const getSearchCompany = async (req, res) => {
    try {
        const userId = req.user.id;
        const keyword = req.query.keyword?.toString() ?? "";
        const page = parseInt(req.query.page?.toString() ?? "1") || 1;
        const limit = parseInt(req.query.limit?.toString() ?? "5") || 5;
        const offset = (page - 1) * limit;
        const where = keyword
            ? { name: { contains: keyword, mode: "insensitive" } }
            : {};
        const allCompanies = await prismaClient_1.prisma.companies.findMany({
            include: { category: true },
        });
        const rankMaps = {
            applicant: new Map(),
            revenue: new Map(),
            employee: new Map(),
        };
        const applicantCounts = await prismaClient_1.prisma.userApplications.groupBy({
            by: ["companyId"],
            _count: { companyId: true },
        });
        const userApplicationCountMap = new Map(applicantCounts.map((uc) => [uc.companyId, uc._count.companyId]));
        allCompanies
            .slice()
            .sort((a, b) => (userApplicationCountMap.get(b.id) || 0) -
            (userApplicationCountMap.get(a.id) || 0))
            .forEach((company, index) => {
            rankMaps.applicant.set(company.id, index + 1);
        });
        allCompanies
            .slice()
            .sort((a, b) => Number(b.salesRevenue) - Number(a.salesRevenue))
            .forEach((company, index) => {
            rankMaps.revenue.set(company.id, index + 1);
        });
        allCompanies
            .slice()
            .sort((a, b) => b.employeeCnt - a.employeeCnt)
            .forEach((company, index) => {
            rankMaps.employee.set(company.id, index + 1);
        });
        const [totalItems, companies] = await Promise.all([
            prismaClient_1.prisma.companies.count({ where }),
            prismaClient_1.prisma.companies.findMany({
                where,
                skip: offset,
                take: limit,
                include: { category: true },
            }),
        ]);
        const totalPages = Math.ceil(totalItems / limit);
        const formattedCompanies = companies.map((company) => ({
            id: company.id,
            name: company.name,
            image: company.image,
            content: company.content,
            employeeCnt: company.employeeCnt,
            salesRevenue: company.salesRevenue.toString(),
            categories: company.category.map((c) => c.category),
            applicantCount: userApplicationCountMap.get(company.id) || 0,
            applicantRank: rankMaps.applicant.get(company.id) || null,
            revenueRank: rankMaps.revenue.get(company.id) || null,
            employeeRank: rankMaps.employee.get(company.id) || null,
        }));
        return res.status(200).json({
            success: true,
            message: "검색한 회사 목록 조회 성공",
            data: {
                companies: formattedCompanies,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems,
                },
            },
        });
    }
    catch (error) {
        const { status, message } = (0, errHandler_1.handleError)(error);
        res.status(status).json({ message });
    }
};
const ComparisonList = {
    getCompanyApplication,
    getSearchCompany,
};
exports.default = ComparisonList;
//# sourceMappingURL=getComparison.js.map