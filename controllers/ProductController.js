import pkg from "../generated/prisma/index.js";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const ProductController = {
  create: async (req, res) => {
    try {
      const qty = req.body.qty

      if (qty > 1000) {
        res.status(400).json({ message: "Quantity exceeds limit of 1,000" });
        return;
      }

      for (let i = 0; i < qty; i++) {
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
          serial: req.body.serial ?? '', // เพิ่ม serial
          status: 'instock'
        },
      });
        
      }
      
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
        where: {
          status: "instock" // แสดงเฉพาะสินค้าที่มีสถานะ instock
        }
      });
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  update: async (req, res) => {
    try {
      const { id, ...data } = req.body;
      await prisma.product.update({
        where: { id: String(req.params.id) },
        data,
      });
      res.json({ message: "Product updated successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  remove: async (req, res) => {
    try {
      await prisma.product.update({
        where: { id: String(req.params.id) },
        data: { status: "delete"} // แปลง id เป็น String
      });
      res.json({ message: "Product deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message}  )
    }
  }
};