import pkg from "../generated/prisma/index.js";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const CompanyController = {
  create: async (req, res) => {
    try {
      const oldCompany = await prisma.company.findFirst({
        where: { name: req.body.name }
      });

      const payload = {
        name: req.body.name,
        address: req.body.address,
        color: req.body.color,
        phone: req.body.phone,
        email: req.body.email ?? "",
        taxCode: req.body.taxCode,
      };

      if (oldCompany) {
        await prisma.company.update({
          where: { id: oldCompany.id },
          data: payload,
        });
        res.status(200).json({ message: "Updated successfully" });
      } else {
        await prisma.company.create({
          data: payload,
        });
        res.status(201).json({ message: "Created successfully" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  list: async (req, res) => {
    try {
      const company = await prisma.company.findFirst();
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};
