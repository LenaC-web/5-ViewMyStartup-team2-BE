"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prismaClient_1 = require("../../prismaClient");
const client_1 = require("@prisma/client");
const getApplicationList = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ message: "일치하는 userId가 없습니다." });
        }
        const page = Number(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const filter = req.query.filter || "all";
        let whereCondition = {
            userId,
        };
        const isApplicationStatus = Object.values(client_1.ApplicationStatus).includes(filter.toUpperCase());
        if (filter !== "all" && isApplicationStatus) {
            whereCondition.status = filter.toUpperCase();
        }
        const applications = await prismaClient_1.prisma.userApplications.findMany({
            where: whereCondition,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        });
        const companyIds = applications.map((app) => app.companyId);
        if (companyIds.length === 0) {
            return res.status(200).json({ applications: [], totalPages: 0, page });
        }
        const companies = await prismaClient_1.prisma.companies.findMany({
            where: { id: { in: companyIds } },
            select: {
                id: true,
                name: true,
                image: true,
                content: true,
                category: true,
            },
        });
        const applicantCounts = await prismaClient_1.prisma.userApplications.groupBy({
            by: ["companyId"],
            where: { companyId: { in: companyIds } },
            _count: { companyId: true },
        });
        const applicantCountMap = Object.fromEntries(applicantCounts.map((app) => [app.companyId, app._count.companyId]));
        const formattedApplications = companies.map((company) => {
            const application = applications.find((app) => app.companyId === company.id);
            return {
                id: application?.id,
                name: company.name,
                image: company.image,
                content: company.content,
                category: company.category,
                status: application?.status || client_1.ApplicationStatus.PENDING,
                applicantCnt: applicantCountMap[company.id] || 0,
                createdAt: application?.createdAt,
                updatedAt: application?.updatedAt,
            };
        });
        const totalApplications = await prismaClient_1.prisma.userApplications.count({
            where: whereCondition,
        });
        const totalPages = Math.ceil(totalApplications / limit);
        const response = {
            applications: formattedApplications,
            page,
            totalPages,
        };
        res.status(200).send(response);
    }
    catch (e) {
        console.log("err:", e);
        res.status(500).send({ message: "서버 에러입니다." });
    }
};
exports.default = getApplicationList;
//# sourceMappingURL=getApplicationList.js.map