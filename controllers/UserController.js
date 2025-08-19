import pkg from "../generated/prisma/index.js";
const { PrismaClient } = pkg;
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { info } from "console";

dotenv.config();

const prisma = new PrismaClient();

export const UserController = {
  signIn: async (req, res) => {
    try {
      
      const user = await prisma.user.findFirst({
        where: {
          username: req.body.username,
          password: req.body.password,
          status: "active",

        },
      });

    if (!user) {
      return res.status(401).json({ message: "User not found" }); 

    }
    const token = jwt.sign({id: user.id}, process.env.SECRET_KEY, {
      expiresIn: "1year",
    });

    res.status(200).json({ token });
    
    } catch (error) {
      console.error('SignIn error:', error);
      res.status(500).json({ message: error.message });
    }
  },
  info: async (req, res) => {
    try {
      const headers = req.headers.authorization;
      const token = headers && headers.split(" ")[1];
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      const user = await prisma.user.findFirst({
        where: {id: decoded.id},
        select: {
          name: true,
          level: true,
          username: true,
        }
      });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  update:async (req, res) => {
    try {
      const headers = req.headers.authorization;
      const token = headers && headers.split(" ")[1];
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      const olderUser = await prisma.user.findFirst({
        where: { id: decoded.id },
      });
      const newPassword = req.body.password !== undefined ? req.body.password : olderUser.password;
      await prisma.user.update({
        where: { id: decoded.id },
        data: {
          name: req.body.name,
          username: req.body.username,
          password: newPassword
        }
         
      })
      res.status(200).json({ message: "User updated successfully" });
      
    } catch (error) {
      console.error('Update User error:', error);
      res.status(500).json({ message: error.message });
    }
  }
};
