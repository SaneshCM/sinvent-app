import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import sendEmail from '../utils/sendEmail.js';
import Token from '../models/tokenModel.js'; 
import crypto from 'crypto';

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn:"1d"});
}

// Register User
const registerUser = asyncHandler( async (req, res) => {
    const {name, email, password} = req.body;

    if(!name || !email || !password) {
        res.status(400);
        throw new Error("please fillin all required fields");
    }
    if(password.length < 6) {
        res.status(400);
        throw new Error("password must be atleast 6 characters");
    }

    //check if user email already exists
    const userExists = await User.findOne({email});
    
    if(userExists) {
        res.status(400);
        throw new Error("Email has already been registered");
    }

    //Create new user
    const user = await User.create({
        name,
        email,
        password
    });

    //Generate Token
    const token = generateToken(user._id);

    // send HTTP-only cookie
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), //1 day
        sameSite: "none", //front end and backend different url, so set to none
        secure: true //https
    });

    if(user) {
        const {_id, name, email, photo, phone, bio} = user
        res.status(201).json({
            _id, name, email, photo, phone, bio, token
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }

});

//Login User
const loginUser = asyncHandler( async (req, res) => {
    const {email, password} = req.body;

    //validate request
    if (!email || !password) {
        res.status(400);
        throw new Error("Please add email and password");
    }

    //check if user exists
    const user = await User.findOne({email});

    //validate user exists
    if (!user) {
        res.status(400);
        throw new Error("User not found, please signup");
    }

    //user exists, check if password is correct or not
    const passwordIsCorrent = await bcrypt.compare(password, user.password);

    //Generate Token
    const token = generateToken(user._id);

    // send HTTP-only cookie
    if(passwordIsCorrent){
        res.cookie("token", token, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400), //1 day
            sameSite: "none", //front end and backend different url, so set to none
            secure: true //https
        });
    }
    if(user && passwordIsCorrent) {
        const {_id, name, email, photo, phone, bio} = user
        res.status(200).json({
            _id, name, email, photo, phone, bio, token
        });
    } else {
        res.status(400);
        throw new Error("Invalid email or password");
    }

});

//Logout user
const logoutUser = asyncHandler(async (req, res) => {
    
    res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0), //current
        sameSite: "none", //front end and backend different url, so set to none
        secure: true //https
    });

    return res.status(200).json({ message: "Succesfully Logged Out"});

});

const getUser = asyncHandler( async (req, res) => {
    const user = await User.findById(req.user._id);
    if(user) {
        const {_id, name, email, photo, phone, bio} = user
        res.status(201).json({
            _id, name, email, photo, phone, bio
        });
    } else {
        res.status(400);
        throw new Error("User not found");
    }
});

//get logged in status
const loginStatus = asyncHandler( async (req, res) => { 
    const token = req.cookies.token;
    if(!token){
        return res.json(false);
    }
    //Verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if(verified) {
        return res.json(true);
    }
    else{
        return res.json(false);
    }
});

//update the user details
const updateUser = asyncHandler( async (req, res) => { 
    const user = await User.findById(req.user._id);
    if(user){
        const {name, email, photo, phone, bio} = user;
        user.email = email;
        user.name = req.body.name || name;
        user.phone = req.body.phone || phone;
        user.bio = req.body.bio || bio;
        user.photo = req.body.photo || photo;
        user.bio = req.body.bio || bio;

        const updatedUser = await user.save();
        res.status(200).json({
            _id: updatedUser._id, 
            name: updatedUser.name, 
            email: updatedUser.email, 
            photo: updatedUser.photo, 
            phone: updatedUser.phone, 
            bio: updatedUser.bio
        });
    }
    else {
        res.status(404);
        throw new Error("user not found");
    }
});

//update password
const changePassword = asyncHandler( async (req, res) => { 
    const user = await User.findById(req.user._id);

    const {oldPassword, password} = req.body;
    //Validate
    if(!oldPassword || !password) {
        res.status(400);
        throw new Error("Please add old and new password");
    }

    //check if old password matches in DB
    const passwordIsCorrent = await bcrypt.compare(oldPassword, user.password);

    //save new password
    if(user && passwordIsCorrent) {
        user.password = password;
        await user.save();
        res.status(200).send("Password changed successfully");
    }else {
        res.status(400);
        throw new Error("Old password is incorrect");
    }
});

const forgotPassword = asyncHandler (async (req, res) => {
    // sendEmail("test mail", "test mail message", "itzme.sanesh@gmail.com", "none", "");
    // res.send("sent");
    const {email} = req.body;
    const user = await User.findOne({email});

    if(!user) {
        res.status(404);
        throw new Error("User does not exist");
    }

    //Delete token if exist in DB
    let token = await Token.findOne({userId: user._id});

    console.log(token);

    if(token){
        await token.deleteOne();
    }

    //create Reset Token
    let resetToken = crypto.randomBytes(32).toString("hex") + user._id;

    console.log(resetToken);

    // Hash token before saving to DB
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    // console.log(hashedToken);

    //save token to DB
    await new Token({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * (60*1000) //Thirty minutes
    }).save();

    //Construct Reset Url
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    //Reset Email
    const message = `
        <h2>Hello ${user.name}</h2>
        <p>Please use below URL to reset your password</p>
        <p>This reset link is valid for 30 minutes only</p>

        <a href=${resetUrl} clicktracking=off>${resetUrl}</a>

        <p> Regards </p>
        <p> Sinvent Team </p>
    `

    const subject = "Password Reset Request - Sinvent"
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER;

    try {
        await sendEmail(subject, message, send_to, sent_from);
        res.status(200).json({success: true, message : "Reset Email Sent"});
    } catch (error) {
        res.status(500);
        throw new Error("Email not sent, please try again");
    }

});

//Reset password
const resetPassword = asyncHandler (async(req, res) => {

    const {password} = req.body;
    const {resetToken} = req.params;

    //Hash the resettoken to compare with DB
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    
    //Find Token in DB
    const userToken = await Token.findOne({
        token: hashedToken,
        expiresAt: {$gt: Date.now()}
    });

    if(!userToken) {
        res.status(500);
        throw new Error("Invalid or expired token");
    }
    else {
        //Find User
        const user = await User.findOne({_id: userToken.userId});
        user.password = password;
        await user.save();
        res.status(200).json({
            message: "Password reset Successful, Please login"
        });
    }
    res.send("reset password");
});

export {registerUser, loginUser, logoutUser, getUser, loginStatus, updateUser, changePassword, forgotPassword,resetPassword} 