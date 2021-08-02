import express from 'express';
import { postJoin, postLogin, getLogout, getAuth, githubLogin, kakaoLogin, kakaoUnlink, googleLogin, naverLogin, naverUnlink, postUpdatePwd, postUpdateUser, postUpdateBlogInfo } from '../../controllers/userControllers.js';
import { authMiddleware } from '../../middlewares/auth.js';

const userRouter = express.Router();

userRouter.post("/join", postJoin);
userRouter.post("/login", postLogin);
userRouter.get("/logout", authMiddleware, getLogout);

userRouter.post("/update", postUpdateUser);
userRouter.post("/update/password", postUpdatePwd);
userRouter.post("/update/blog", postUpdateBlogInfo);

userRouter.post("/github", githubLogin);

userRouter.post("/kakao", kakaoLogin);
userRouter.post("/kakao/unlink", kakaoUnlink);

userRouter.post("/google", googleLogin);

userRouter.post("/naver", naverLogin);
userRouter.post("/naver/unlink", naverUnlink);

userRouter.get("/auth", authMiddleware, getAuth);

export default userRouter;
