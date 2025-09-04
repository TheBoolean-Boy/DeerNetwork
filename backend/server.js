import express from "express";
import authRouter from "./routes/auth.routes.js"; 
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use("/api/auth", authRouter);



app.listen(PORT, () => {
  connectDB();
  console.log(`Server is listening at PORT:${PORT}`)
})