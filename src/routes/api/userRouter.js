import express from 'express';
import { postJoin, postLogin, getLogout, getAuth, githubLogin, kakaoLogin, kakaoUnlink, googleLogin, naverLogin, naverUnlink } from '../../controllers/userControllers.js';
import { authMiddleware } from '../../middlewares/auth.js';

const userRouter = express.Router();

userRouter.post("/join", postJoin);
userRouter.post("/login", postLogin);
userRouter.post("/github", githubLogin);
userRouter.post("/kakao", kakaoLogin);
userRouter.post("/kakao/unlink", kakaoUnlink);
userRouter.post("/google", googleLogin);
userRouter.post("/naver", naverLogin);
userRouter.post("/naver/unlink", naverUnlink);
userRouter.get("/logout", authMiddleware, getLogout);
userRouter.get("/auth", authMiddleware, getAuth);

export default userRouter;
