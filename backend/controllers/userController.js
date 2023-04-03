import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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

});

export {registerUser, loginUser, logoutUser, getUser, loginStatus} 