import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

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
const loginUser = asyncHandler( (req, res) => {
    res.send("login");
});

export {registerUser, loginUser} 