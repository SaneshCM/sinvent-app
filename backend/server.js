import express from "express"
import { } from "dotenv/config"
import mongoose from "mongoose"
import bodyParser from "body-parser"
import cors from "cors"

const app = express();

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