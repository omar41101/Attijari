//import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRoutes from './Routes/UserRoute.js'
import bankAccountRoutes from './Routes/BankAccountRoute.js'
import cardRoutes from './Routes/CardRoute.js'
import BankAccount from './models/BankAccount.js'; // Import BankAccount model
import connectDB from "./config/db.js";
//import uploadRoutes from "./routes/uploadRoutes.js"
dotenv.config();
const port = process.env.PORT || 1919;

connectDB();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/users", userRoutes)
app.use("/api/bankaccounts", bankAccountRoutes)
app.use("/api/cards", cardRoutes)
//app.use("/api/category",categoryRoutes)
//app.use("/api/products", productRoutes)
//app.use("/api/upload", uploadRoutes)

//const __dirname = path.resolve()
//app.use('/uploads', express.static(path.join(__dirname +'/uploads')))
app.listen(port, () => console.log(`server running on port: ${port}`));