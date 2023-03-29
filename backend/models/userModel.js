import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
    name:{
        type: String,
        required: [true, "Please add a name"]
    },
    email:{
        type: String,
        required: [true, "Please add an email"],
        unique: true,
        trim: true,
        match: [
            /^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/gm,"Please enter a valid email"
        ]
    },
    password:{
        type: String,
        required: [true, "Please add password"],
        minLength: [6, "Password must contain atleast 6 characters"],
        // maxLength: [23, "Password must not exceed 23 characters"]
    },
    photo: {
        type: String,
        required: [true, "Please add photo"],
        default: "https://i.ibb.co/4pDNDk1/avatar.png"
    },
    phone: {
        type: String,
        default: "+91"
    },
    bio: {
        type: String,
        maxLength: [250, "Password must not exceed 250 characters"],
        default: "bio"
    }
}, {
    timestamps: true
});

//encrypt password
userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
})

const User = mongoose.model("User", userSchema);
export default User;