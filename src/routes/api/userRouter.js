import express from 'express';
import { postJoin, postLogin, getLogout, getAuth, githubLogin } from '../../controllers/userControllers.js';
import { authMiddleware } from '../../middlewares/auth.js';

const userRouter = express.Router();

userRouter.post("/join", postJoin);
userRouter.post("/login", postLogin);
userRouter.post("/github", githubLogin);
userRouter.get("/logout", authMiddleware, getLogout);
userRouter.get("/auth", authMiddleware, getAuth);

export default userRouter;
