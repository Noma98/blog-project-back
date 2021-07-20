import express from 'express';
import { postJoin, postLogin } from '../../controllers/userControllers.js';

const userRouter = express.Router();

userRouter.post("/join", postJoin);
userRouter.post("/login", postLogin);

export default userRouter;
