import pkg from "../generated/prisma/index.js";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const ProductController = {
  create: async (req, res) => {
    try {
      await prisma.product.create({
        data: {
          name: req.body.name,
          release: req.body.release,
          color: req.body.color,
          price: parseInt(req.body.price),
          customerName: req.body.customerName,
          customerPhone: req.body.customerPhone ?? '',
          customerAddress: req.body.customerAddress ?? '',
          remarks: req.body.remarks ?? '', // เปลี่ยนจาก remark เป็น remarks
          status: 'instock'
        },
      });
      res.status(201).json({ message: "Product created successfully" });
    } catch (error) {
      console.error('Create Product error:', error);
      res.status(500).json({ message: error.message });
    }
  },
  list: async (req, res) => {
    try {
      const products = await prisma.product.findMany({
        orderBy: { 
          id : 'desc' 
        },
      });
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};