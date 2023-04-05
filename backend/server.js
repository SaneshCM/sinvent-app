import express from "express"
import { } from "dotenv/config"
import mongoose from "mongoose"
import bodyParser from "body-parser"
import cors from "cors"
import userRoute from "./routes/userRoute.js"
import errorHandler from "./middleWare/errorMiddleware.js"
import cookieParser from "cookie-parser"
import productRoute from "./routes/productRoute.js"
import path from 'path';
import { fileURLToPath } from 'url';
import contactRoute from "./routes/contactRoute.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());

//For file upload
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//routes Middleware
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/contact", contactRoute);

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