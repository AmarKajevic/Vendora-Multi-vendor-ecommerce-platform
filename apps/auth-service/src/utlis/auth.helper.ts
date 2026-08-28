import crypto from "crypto";
import { ValidationError } from "@packages/error-handler";
import redis from "@packages/libs/redis";
import { sendEmail } from "./SendMail";
import { NextFunction,Request,Response } from "express";
import prisma from "@packages/libs/prisma";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


export const validationRegistrationData = (

    data: any,
    userType: "user" | "seller") => {
    const {name, email, password, phone_number, country} = data;

    if(!name || !email || !password || (userType === "seller" && (!phone_number || !country))) {
        throw new ValidationError(`Missing required fields `);
    }
    if(!emailRegex.test(email)) {
        throw new ValidationError("Invalid email format");
    }
    
}

export const checkOtpRestrictions = async (email: string, next:NextFunction) => {
    if(await redis.get(`otp_lock:${email}`)){
     throw new ValidationError("Account locked due to multiple failed OTP attempts. Please try again after 30 minutes.");
    }
    if(await redis.get(`otp_spam_lock:${email}`)) {
       throw new ValidationError("Too many OTP requests. Please try again after 1 hour.");
    }
    if(await redis.get(`otp_cooldown:${email}`)) {
        throw new ValidationError("OTP already sent. Please wait before requesting another.");
    }
}

export const trackOtpRequests = async (email:string, next:NextFunction) => {
    const otpRequestKey = `otp_request_count:${email}`;
    let otpRequest = parseInt((await redis.get(otpRequestKey)) || "0");

    if(otpRequest >= 2){
        await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 3600); // Lock for 1 hour
       throw new ValidationError("Too many OTP requests. Please try again after 1 hour.");
    }
    await redis.set(otpRequestKey, otpRequest + 1, "EX", 3600); // Count resets after 1 hour
}

export const sendOtp = async (name:string, email:string, template: string) => {
    const otp = crypto.randomInt(1000, 9999).toString();
    await sendEmail(email, "Verify your Email", template, {name, otp});

    // OTP valid for 5 minutes
    await redis.set(`otp:${email}`, otp, "EX", 300); 
     // Cooldown of 1 minute between OTP requests
    await redis.set(`otp_cooldown:${email}`, "true", "EX", 60);

    


}

export const verifyOtp = async (email:string, otp:string, next:NextFunction) => {
    const stotredOtp = await redis.get(`otp:${email}`);
    if(!stotredOtp) {
        throw new ValidationError("Invalid or expired OTP");
    }
    const failedAttemptsKey = `otp_attempts:${email}`;
    const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || "0");

    if(stotredOtp !== otp) {
        if(failedAttempts >= 2){
            await redis.set(`otp_lock:${email}`, "locked", "EX", 1800); // Lock for 30 minutes
            await redis.del(`otp:${email}`, failedAttemptsKey); // Clear OTP and failed attempts
            throw new ValidationError("Account locked due to multiple failed OTP attempts. Please try again after 30 minutes.");
        } 
        await redis.set(failedAttemptsKey, failedAttempts + 1, "EX", 300); // Count resets after 5 minutes
        throw new ValidationError(`Incorrect OTP. You have ${2 - failedAttempts} attempts left.`);
    }
    

    await redis.del(`otp:${email}`, failedAttemptsKey); // Clear OTP and failed attempts on successful verification
}

export const handleForgotPassword =  async (
    req:Request,
    res:Response,
    next:NextFunction,
    userType: "user" |"seller"
) => {
    try {
        const{email} = req.body;

        if(!email) throw new ValidationError("Email is required!");

        //find user/seller in Db

        const user = userType ==="user" 
        ? await prisma.users.findUnique({where: {email}})
        : await prisma.sellers.findUnique({where: {email}})

        if(!user) throw new ValidationError(`${userType} not found!`);

        //check otp restriction 
        await checkOtpRestrictions(email, next);
        await trackOtpRequests(email, next);

        //generate OTP and send Email

        await sendOtp(user.name, email, userType === "user" ? "forgot-password-user-mail" : "forgot-password-seller-mail");

        res.status(200).json({message: "Otp sent to email. Please verify your account "})
    } catch (error) {
        next(error)
    }
}

export const verifyForgotPasswordOtp = async(req: Request, res:Response, next:NextFunction) => {
    try {
        const{email, otp} = req.body;
        if(!email || !otp){
            return new ValidationError("Email and OTP are required!");
        }
        await verifyOtp(email, otp, next);
        res.status(200).json({message: "OTP verified. You can now reset your password"})
    } catch (error) {
        return next(error)
    }
}