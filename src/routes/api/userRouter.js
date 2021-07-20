import express from 'express';
import { postJoin } from '../../controllers/userControllers.js';

const userRouter = express.Router();

userRouter.post("/join", postJoin);

export default userRouter;
