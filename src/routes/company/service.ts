import { prisma } from "../../prismaClient";
import { Request, Response } from "express";

// 📝회사 목록 조회 getCompanies
/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: 회사 목록 조회
 *     tags: [Company]
 *     description: 삭제되지 않은 모든 회사의 목록을 조회합니다.
 *     responses:
 *       200:
 *         description: 회사 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   image:
 *                     type: string
 *                   content:
 *                     type: string
 *                   salesRevenue:
 *                     type: string
 *                   employeeCnt:
 *                     type: string
 *       500:
 *         description: 서버 에러
 */
const getCompanies = async (req: Request, res: Response) => {
  try {
    const companies = await prisma.companies.findMany({
      where: {
        deletedAt: null, //삭제되지 않은 기업만 조회
      },
      orderBy: {
        createdAt: "desc", //최신 생성순 정렬
      },
    });
    // salesRevenue를 BigInt에서 String으로 변환
    const formattedCompanies = companies.map((company) => ({
      ...company,
      salesRevenue: company.salesRevenue
        ? company.salesRevenue.toString()
        : "0", // BigInt 필드를 문자열로 변환
    }));
    res.status(200).json(formattedCompanies); // 성공 결과 반환
  } catch (err) {
    console.error("Error message in getCompanies", err);
    res.status(500).json({ message: "기업 목록 조회 실패" });
  }
};

// 📝회사 상세 조회 getCompany
/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: 특정 회사 상세 조회
 *     tags: [Company]
 *     description: 특정 ID를 가진 기업의 상세 정보를 조회합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 기업 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 회사 상세 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 image:
 *                   type: string
 *                 content:
 *                   type: string
 *                 salesRevenue:
 *                   type: string
 *                 employeeCnt:
 *                   type: string
 *       404:
 *         description: 해당 기업을 찾을 수 없음
 *       500:
 *         description: 서버 에러
 */
const getCompany = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const company = await prisma.companies.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!company) {
      return res.status(404).json({ message: "해당 기업을 찾을 수 없습니다." });
    }

    // salesRevenue를 BigInt에서 String으로 변환
    const formattedCompany = {
      ...company,
      salesRevenue: company.salesRevenue
        ? company.salesRevenue.toString()
        : "0", // BigInt 필드를 문자열로 변환
    };
    res.status(200).json(formattedCompany); // 성공 결과 반환
  } catch (err) {
    console.error("Error message in getCompany", err);
    res.status(500).json({ message: "기업 상세 조회 실패" });
  }
};

/**
 * @swagger
 * /api/companies/detail/{id}:
 *   get:
 *     summary: 특정 회사 조회 (사용자 정보 포함)
 *     tags: [Company]
 *     description: 특정 회사를 조회하며, 사용자의 북마크 여부를 포함하여 반환합니다.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: 조회할 회사의 ID
 *         required: true
 *         schema:
 *           type: string
 *       - name: userId
 *         in: query
 *         description: 조회하는 사용자의 ID (북마크 여부 확인)
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 성공적으로 회사 정보를 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 image:
 *                   type: string
 *                   nullable: true
 *                 content:
 *                   type: string
 *                 salesRevenue:
 *                   type: string
 *                   description: "매출액 (BigInt를 문자열로 변환)"
 *                 employeeCnt:
 *                   type: integer
 *                   description: "사원 수"
 *                 isBookmarked:
 *                   type: boolean
 *                   description: "사용자가 북마크한 상태 여부"
 *       400:
 *         description: 잘못된 요청 (ID 누락 등)
 *       404:
 *         description: 회사를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */

const getCompanyForUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.query as { userId?: string };
  if (!id) {
    return res.status(404).json({ message: "Company의 id값이 필요합니다." });
  }
  if (!userId) {
    return res.status(404).json({ message: "user의 id값이 필요합니다." });
  }
  try {
    const bookmark = await prisma.bookmark.findFirst({
      where: { userId, companyId: id, deletedAt: null },
    });

    const company = await prisma.companies.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
    const apllycant = await prisma.userApplications.findMany({
      where: {
        companyId: id,
        deletedAt: null,
      },
    });
    const category = await prisma.category.findFirst({
      where: {
        company: {
          some: { id },
        },
      },
    });

    if (!company) {
      return res.status(404).json({ message: "해당 기업을 찾을 수 없습니다." });
    }

    const formattedCompany = {
      ...company,
      apllycant: apllycant.length,
      category: category,
      isBookmarked: !!bookmark,
      salesRevenue: company.salesRevenue
        ? company.salesRevenue.toString()
        : "0",
    };
    res.status(200).json(formattedCompany); // 성공 결과 반환
  } catch (err) {
    console.error("Error message in getCompany", err);
    res.status(500).json({ message: "기업 상세 조회 실패" });
  }
};

// 📝회사 생성 createCompany
/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: 회사 생성
 *     tags: [Company]
 *     description: 새로운 기업을 생성합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *               content:
 *                 type: string
 *               salesRevenue:
 *                 type: string
 *               employeeCnt:
 *                 type: string
 *     responses:
 *       201:
 *         description: 회사 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 image:
 *                   type: string
 *                 content:
 *                   type: string
 *                 salesRevenue:
 *                   type: string
 *                 employeeCnt:
 *                   type: string
 *       500:
 *         description: 서버 에러
 */
const createCompany = async (req: Request, res: Response) => {
  const { name, image, content, salesRevenue, employeeCnt } = req.body;
  try {
    const newCompany = await prisma.companies.create({
      data: {
        name,
        image,
        content,
        salesRevenue,
        employeeCnt,
      },
    });
    // BigInt를 문자열로 변환해서 응답에 포함
    const companyWithStringBigInt = {
      ...newCompany,
      salesRevenue: newCompany.salesRevenue.toString(),
    };
    res.status(201).json(companyWithStringBigInt); // 성공 결과 반환
  } catch (err) {
    console.error("Error message in createCompany", err);
    res.status(500).json({ message: "기업 생성 실패" });
  }
};

// 📝회사 정보 수정 updateCompany
/**
 * @swagger
 * /api/companies/{id}:
 *   put:
 *     summary: 회사 정보 수정
 *     tags: [Company]
 *     description: 특정 기업의 정보를 수정합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 기업 ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *               content:
 *                 type: string
 *               salesRevenue:
 *                 type: string
 *               employeeCnt:
 *                 type: string
 *     responses:
 *       200:
 *         description: 회사 정보 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 image:
 *                   type: string
 *                 content:
 *                   type: string
 *                 salesRevenue:
 *                   type: string
 *                 employeeCnt:
 *                   type: string
 *       404:
 *         description: 해당 기업을 찾을 수 없음
 *       500:
 *         description: 서버 에러
 */
const updateCompany = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, image, content, salesRevenue, employeeCnt } = req.body;
  try {
    const updatedCompany = await prisma.companies.update({
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
    res.status(200).json(formattedCompany); // 성공 결과 반환
  } catch (err) {
    console.error("Error message in updateCompany", err);
    res.status(500).json({ message: "기업 수정 실패" });
  }
};

// 📝회사 삭제 deleteCompany
/**
 * @swagger
 * /api/companies/{id}:
 *   delete:
 *     summary: 회사 삭제
 *     tags: [Company]
 *     description: 특정 기업을 삭제합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 기업 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 회사 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 image:
 *                   type: string
 *                 content:
 *                   type: string
 *                 salesRevenue:
 *                   type: string
 *                 employeeCnt:
 *                   type: string
 *       404:
 *         description: 해당 기업을 찾을 수 없음
 *       500:
 *         description: 서버 에러
 */
const deleteCompany = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deletedCompany = await prisma.companies.update({
      where: { id },
      data: {
        deletedAt: new Date(), //삭제날짜 기록
      },
    });
    // 삭제된 회사 정보를 반환하기 전에 BigInt 필드 포맷팅
    const formattedDeletedCompany = {
      ...deletedCompany,
      salesRevenue: deletedCompany.salesRevenue.toString(),
      employeeCnt: deletedCompany.employeeCnt.toString(),
    };
    res.status(200).json(formattedDeletedCompany); // 성공 결과 반환
  } catch (err) {
    console.error("Error message in deleteCompany", err);
    res.status(500).json({ message: "기업 삭제 실패" });
  }
};

const companyService = {
  getCompanies,
  getCompany,
  getCompanyForUser,
  createCompany,
  updateCompany,
  deleteCompany,
};

export default companyService;
