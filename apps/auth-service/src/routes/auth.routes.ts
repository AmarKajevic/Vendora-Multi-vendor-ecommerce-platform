import express, { Router } from "express";
import { addUserAddress, createShop, createStripeConnectLink, deleteUserAddress, getLayoutData, getSeller, getSellerDetails, getUser, getUserAddresses, loggedInAdmin, LoginAdmin, loginSeller, loginUser, logOutUser, refreshToken, registerSeller, resetUserPassword, updateUserPassword, userForgotPassword, userRegistration, verifySeller, verifyUser, verifyUserForgotPassword } from "../controller/auth.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isAdmin, isSeller } from "@packages/middleware/authorizeRoles";


const router:Router = express.Router();

router.post("/user-registration", userRegistration);
router.post("/verify-user", verifyUser);
router.post("/login-user", loginUser);
router.get("/logout-user", isAuthenticated, logOutUser);
router.post("/forgot-password-user", userForgotPassword);
router.post("/refresh-token", refreshToken);
router.get("/logged-in-user", isAuthenticated, getUser);
router.post("/reset-password-user", resetUserPassword);
router.post("/verify-forgot-password-user", verifyUserForgotPassword);
router.post("/seller-registration", registerSeller);
router.post("/verify-seller", verifySeller);
router.post("/create-shop", createShop);
router.post("/create-stripe-link", createStripeConnectLink);
router.post("/login-seller" , loginSeller)
router.get("/logged-in-seller",isAuthenticated,isSeller, getSeller)
router.get("/get-seller/:id", getSellerDetails)
router.post("/add-address", isAuthenticated, addUserAddress)
router.delete("/delete-address/:addressId", isAuthenticated, deleteUserAddress);
router.get("/shipping-addresses", isAuthenticated, getUserAddresses)
router.post("/change-password", isAuthenticated, updateUserPassword)
router.post("/login-admin", LoginAdmin)
router.get("/logged-in-admin", isAuthenticated,isAdmin, loggedInAdmin)
router.get("/get-layouts", getLayoutData)

export default router;