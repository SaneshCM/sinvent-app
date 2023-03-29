import express from "express"
import { } from "dotenv/config"
import mongoose from "mongoose"
import bodyParser from "body-parser"
import cors from "cors"
import userRoute from "./routes/userRoute.js"
import errorHandler from "./middleWare/errorMiddleware.js"
import cookieParser from "cookie-parser"

const app = express();

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());

//routes Middleware
app.use("/api/users", userRoute);

//routes
app.get("/",(req,res)=>{
    res.send("home page");
})

//Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

//connect to mongodb
mongoose
    .connect(process.env.MONGO_URI)
    .then(()=>{
        app.listen(PORT, () => {
            console.log(`server running on port ${PORT}`)
        })
    })
    .catch((err) => {
        console.log(err);
    })