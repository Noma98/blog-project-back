import express from "express";
import morgan from 'morgan';
import userRouter from './routes/api/userRouter.js';
import 'dotenv/config';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/users", userRouter);

export default app;


