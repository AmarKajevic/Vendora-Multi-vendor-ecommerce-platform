import { isAdmin } from "@packages/middleware/authorizeRoles";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import express, {Router} from "express";
import { addCategory, addNewAdmin, addSubcategory, banUser, getAllAdmins, getAllCustomizations, getAllEvents, getAllNotifications, getAllProducts, getAllSellers, getAllUsers, getUserNotifications, markNotificationAsRead, uploadBanner, uploadLogo } from "../controllers/admin.controller";


const router:Router = express.Router();

router.get("/get-all-products", isAuthenticated, isAdmin, getAllProducts)
router.get("/get-all-events", isAuthenticated, isAdmin, getAllEvents)
router.get("/get-all-admins", isAuthenticated, isAdmin, getAllAdmins)
router.get("/get-all-sellers", isAuthenticated, isAdmin, getAllSellers)
router.get("/get-all-users", isAuthenticated, isAdmin, getAllUsers)
router.put("/add-new-admin", isAuthenticated, isAdmin, addNewAdmin)
router.get("/get-all", getAllCustomizations)
router.put("/ban-user/:userId", isAuthenticated, isAdmin, banUser)
router.get("/get-all-notifications", isAuthenticated,isAdmin, getAllNotifications)
router.get("/get-user-notifications", isAuthenticated, getUserNotifications)
router.post("/mark-notification-as-read", isAuthenticated, markNotificationAsRead)
router.post("/add-category",isAuthenticated,isAdmin, addCategory);
router.post("/add-subcategory",isAuthenticated,isAdmin, addSubcategory);
router.post("/upload-logo",isAuthenticated, isAdmin,express.json({ limit: '10mb' }), uploadLogo);
router.post("/upload-banner",isAuthenticated,isAdmin, express.json({ limit: '10mb' }), uploadBanner);

export default router;