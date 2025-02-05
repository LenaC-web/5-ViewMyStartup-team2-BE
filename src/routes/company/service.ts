import { prisma } from "../../prismaClient";
import { Request, Response } from "express";

// 요청 데이터 타입 정의 interface

// 📝회사 목록 조회 getCompanies
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

// 📝회사 생성 createCompany
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
  createCompany,
  updateCompany,
  deleteCompany,
};

export default companyService;
