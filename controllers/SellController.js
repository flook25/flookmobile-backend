import pkg from "../generated/prisma/index.js";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const SellController = {
    create: async (req, res) => {
        try {
            const { serial } = req.body; // Use destructuring for cleaner code
            
            const product = await prisma.product.findFirst({
                where: { serial: serial }
            });

            if (!product) {
                // If product is not found, return an error and stop execution
                return res.status(400).json({ message: "Product not found" });
            }
            
            await prisma.sell.create({
                data: {
                    productId: product.id,
                    price: req.body.price,
                    payDate: new Date(),
                    status: "pending"
                }
            });
                
            // Send success response after the sell record has been created
            res.status(201).json({ message: "Sell created successfully" });
        } catch (err) {
            // Use .send() or .json() with a specific status code for errors
            res.status(500).json({ message: err.message });
        }
    }
};