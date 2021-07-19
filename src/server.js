import express from "express";
import morgan from 'morgan';
import testRouter from './routes/api/testRouter.js';
import 'dotenv/config';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", testRouter);

export default app;


