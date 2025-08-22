// --- 1. Use the modern 'import' syntax ---
// This replaces 'const { PrismaClient } = require("@prisma/client");'
// And also replaces the 'import pkg from ...' syntax with a more standard one.
import pkg from "../generated/prisma/index.js";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();
// --- 2. Use the 'export' keyword directly on the const ---
// This makes the SellController available for other files to import.
export const SellController = {
    /**
     * Creates a new 'pending' sale item.
     */
    create: async (req, res) => {
        try {
            const { serial, price } = req.body;

            if (!serial || price === undefined) {
                return res.status(400).json({ message: "Serial and price are required." });
            }

            const product = await prisma.product.findFirst({
                where: {
                    serial: serial,
                    status: 'instock'
                }
            });

            if (!product) {
                return res.status(404).json({ message: "Product not found or is not in stock." });
            }

            await prisma.sell.create({
                data: {
                    productId: product.id,
                    price: Number(price),
                    payDate: new Date(),
                    status: 'pending'
                }
            });

            res.status(201).json({ message: "success" });
        } catch (error) {
            console.error("Error in SellController.create:", error);
            res.status(500).json({ message: error.message });
        }
    },

    /**
     * Lists all items currently in the 'pending' state.
     */
    list: async (req, res) => {
        try {
            const sells = await prisma.sell.findMany({
                where: {
                    status: 'pending'
                },
                orderBy: {
                    // Note: Sorting by ID in MongoDB might not be chronological.
                    // It's better to sort by a timestamp field if needed.
                    id: 'desc'
                },
                select: {
                    id: true,
                    price: true,
                    createdAt: true, 
                    product: {
                        select: {
                            serial: true,
                            name: true
                        }
                    }
                }
            });
            res.status(200).json(sells);
        } catch (error) {
            console.error("Error in SellController.list:", error);
            res.status(500).json({ message: error.message });
        }
    },

    /**
     * Removes a single item from the 'pending' sale list by its ID.
     */
    remove: async (req, res) => {
        try {
            const { id } = req.params;

            if (!id || id.length !== 24) {
                return res.status(400).json({ message: "Invalid ID format." });
            }

            await prisma.sell.delete({
                where: {
                    id: id
                }
            });
            res.status(200).json({ message: "success" });
        } catch (error) {
            console.error("Error in SellController.remove:", error);
            if (error.code === 'P2025') {
                return res.status(404).json({ message: "Item to remove not found." });
            }
            res.status(500).json({ message: error.message });
        }
    },

    /**
     * Confirms all pending sales, updating product and sell statuses.
     */
    confirm: async (req, res) => {
        try {
            const pendingSells = await prisma.sell.findMany({
                where: {
                    status: 'pending'
                }
            });

            if (pendingSells.length === 0) {
                return res.status(400).json({ message: "No pending items to confirm." });
            }

            for (const sell of pendingSells) {
                await prisma.product.update({
                    where: {
                        id: sell.productId
                    },
                    data: {
                        status: 'sold'
                    }
                });
            }

            await prisma.sell.updateMany({
                where: {
                    status: 'pending'
                },
                data: {
                    status: 'paid',
                    payDate: new Date()
                }
            });

            res.status(200).json({ message: "success" });
        } catch (error) {
            console.error("Error in SellController.confirm:", error);
            res.status(500).json({ message: error.message });
        }
    },

    /**
     * Provides dashboard summary data for a given year.
     */
    dashboard: async (req, res) => {
        try {
            const year = req.params.year ? Number(req.params.year) : new Date().getFullYear();
            const startDate = new Date(`${year}-01-01`);
            const endDate = new Date(`${year + 1}-01-01`);

            const income = await prisma.sell.aggregate({
                _sum: {
                    price: true
                },
                where: {
                    status: 'paid',
                    payDate: {
                        gte: startDate,
                        lt: endDate
                    }
                }
            });
            
            const countSell = await prisma.sell.count({
                where: {
                    status: 'paid',
                    payDate: {
                        gte: startDate,
                        lt: endDate
                    }
                }
            });

            res.status(200).json({
                totalIncome: income._sum.price || 0,
                totalSale: countSell
            });
        } catch (error) {
            console.error("Error in SellController.dashboard:", error);
            res.status(500).json({ message: error.message });
        }
    },

    /**
     * Retrieves the history of all completed ('paid') sales.
     */
    history: async (req, res) => {
        try {
            const sells = await prisma.sell.findMany({
                where: {
                    status: 'paid'
                },
                orderBy: {
                    id: 'desc'
                },
                include: {
                    product: {
                        select: {
                            serial: true,
                            name: true
                        }
                    }
                }
            });
            res.status(200).json(sells);
        } catch (error) {
            console.error("Error in SellController.history:", error);
            res.status(500).json({ message: error.message });
        }
    },

    /**
     * Retrieves detailed information for a single completed ('paid') sale.
     */
    info: async (req, res) => {
        try {
            const { id } = req.params;

            if (!id || id.length !== 24) {
                return res.status(400).json({ message: "Invalid ID format." });
            }

            const sell = await prisma.sell.findUnique({
                where: {
                    id: id,
                    status: 'paid'
                },
                include: {
                    product: true
                }
            });

            if (!sell) {
                return res.status(404).json({ message: "Sale record not found." });
            }

            res.status(200).json(sell);
        } catch (error) {
            console.error("Error in SellController.info:", error);
            res.status(500).json({ message: error.message });
        }
    }
};

// --- 3. DELETE the old 'module.exports' line ---
// No longer needed when using 'export const' above.