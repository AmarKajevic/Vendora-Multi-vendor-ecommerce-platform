import isAuthenticated from "@packages/middleware/isAuthenticated"
import express from "express"
import { getShop, markNotificationAsRead, sellerNotifications, uploadAvatar, uploadCoverBanner } from "../controllers/seller.controller"
import { isSeller } from "@packages/middleware/authorizeRoles"

const router = express.Router()

router.get("/seller-notifications",isAuthenticated,isSeller, sellerNotifications)
router.post("/mark-notification-as-read", isAuthenticated, markNotificationAsRead)
router.post("/upload-avatar", isAuthenticated,isSeller, uploadAvatar)
router.post("/upload-coverBanner", isAuthenticated,isSeller, uploadCoverBanner)
router.get("/get-shop", isAuthenticated, isSeller, getShop)

export default router;