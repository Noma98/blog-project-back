import express from 'express';
import { postJoin, postLogin, getLogout } from '../../controllers/userControllers.js';
import { authMiddleware } from '../../middlewares/auth.js';

const userRouter = express.Router();

userRouter.post("/join", postJoin);
userRouter.post("/login", postLogin);
userRouter.get("/logout", authMiddleware, getLogout);

export default userRouter;
