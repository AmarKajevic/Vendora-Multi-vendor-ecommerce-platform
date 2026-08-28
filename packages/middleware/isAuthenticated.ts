import prisma from "../../packages/libs/prisma"
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
    try {
        console.log('🔍 Cookies:', req.cookies); // vidi sve kolačiće

        const token = req.cookies["accessToken"] || req.cookies["seller-access-token"] || req.headers.authorization?.split(" ")[1];
        console.log('🔍 Token used:', token ? token.substring(0, 20) + '...' : 'missing');

        if (!token) {
            return res.status(401).json({ message: "Unauthorized! Token missing" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
            id: string;
            role: "user" | "seller" | "admin";
        };
        console.log('🔍 Decoded role:', decoded.role);

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
        console.log('🔍 Set req.role:', req.role);

        return next();
    } catch (error: any) {
        console.error('🔍 Auth error:', error.message);
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        }
        return res.status(401).json({ message: "Invalid token" });
    }
};



export default isAuthenticated

