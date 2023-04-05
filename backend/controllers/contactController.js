import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import sendEmail from '../utils/sendEmail.js';

const contactUs = asyncHandler(async(req, res)=>{

    const {subject, message} = req.body;
    const user = await User.findById(req.user._id);

    if(!user) {
        res.status(400);
        throw new Error("user not found, please signup");
    }

    // Validation
    if(!subject || !message) {
        res.status(400);
        throw new Error("Please add subject and message");
    }

    //Reset Email
    const emailMessage = `
        <p><b>From : </b>${user.email}</p>
        <p><b>Message : </b>${message}</p>
    `
    const send_to = process.env.EMAIL_USER;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = user.email;

    try {
        await sendEmail(subject, emailMessage, send_to, sent_from, reply_to);
        res.status(200).json({success: true, message : "Mail successfully sent to the developer"});
    } catch (error) {
        res.status(500);
        throw new Error("Email not sent, please try again");
    }
});

export {contactUs};