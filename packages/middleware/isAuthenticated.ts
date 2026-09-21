import prisma from "../../packages/libs/prisma"
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies["accessToken"] || req.cookies["seller-access-token"] || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized! Token missing" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
            id: string;
            role: "user" | "seller" | "admin";
        };

        let account;
        if (decoded.role === "user") {
            account = await prisma.users.findUnique({ where: { id: decoded.id } });
            req.user = account;
        } else if (decoded.role === "seller") {
            account = await prisma.sellers.findUnique({ where: { id: decoded.id }, include: { shop: true } });
            req.seller = account;
        } else if (decoded.role === "admin") {
            account = await prisma.users.findUnique({ where: { id: decoded.id } });
            req.user = account;
        }

        if (!account) {
            return res.status(401).json({ message: "Account not found!" });
        }

        req.role = decoded.role;

        return next();
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        }
        return res.status(401).json({ message: "Invalid token" });
    }
};



export default isAuthenticated

