import express from "express";
import cors from 'cors';
import morgan from 'morgan';
import userRouter from './routes/api/userRouter.js';
import cookieParser from 'cookie-parser';
import folderRouter from './routes/api/folderRouter.js';
import postRouter from './routes/api/postRouter.js';
import commentRouter from './routes/api/commentRouter.js';

const app = express();
app.use(cors({ origin: ['http://localhost:3000', 'https://nomalog.netlify.app'], credentials: true }));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api/users", userRouter);
app.use("/api/folders", folderRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);

app.use("/uploads", express.static("uploads"));

export default app;


