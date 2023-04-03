import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';

const protect = asyncHandler(async (req, res, next)=>{
try {
    const token = req.cookies.token;
    // console.log(token)
    if(!token) {
        res.status(401);
        throw new Error("Not Authorized, please login");
    }

    //Verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("token data---->>"+JSON.stringify(verified));
    //Get userid from token
    const user = await User.findById(verified.id).select("-password");

    if(!user) {
        res.status(401);
        throw new Error("User not found");
    }
    req.user = user;
    next();
} catch (error) {
    res.status(401);
    throw new Error("Not Authorized, please login");
}
});

export default protect;