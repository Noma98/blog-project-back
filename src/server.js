import express from "express";
import morgan from 'morgan';
import userRouter from './routes/api/userRouter.js';
import cookieParser from 'cookie-parser';
import folderRouter from './routes/api/folderRouter.js';
import postRouter from './routes/api/postRouter.js';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api/users", userRouter);
app.use("/api/folders", folderRouter);
app.use("/api/posts", postRouter);

app.use("/uploads", express.static("uploads"));

export default app;


