import express from "express";
import cors from 'cors';
import morgan from 'morgan';
import userRouter from './routes/api/userRouter.js';
import cookieParser from 'cookie-parser';
import folderRouter from './routes/api/folderRouter.js';
import postRouter from './routes/api/postRouter.js';
const app = express();
// const whitelist = [
//     'http://localhost:3000',
//     'https://nomalog.netlify.app',
//     'http://nomalog.netlify.app',
// ];
// const corsOptions = {
//     origin: function (origin, callback) {
//         if (whitelist.indexOf(origin) !== -1) {
//             callback(null, true);
//         } else {
//             callback(new Error("🔥Not allowed by CORS"))
//         }
//     }
// }
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.get("/", (req, res) => {
    res.json({ "hi": "hello world!" });
})
app.use("/api/users", userRouter);
app.use("/api/folders", folderRouter);
app.use("/api/posts", postRouter);

app.use("/uploads", express.static("uploads"));

export default app;


