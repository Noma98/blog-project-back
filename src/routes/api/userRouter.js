import express from 'express';
import { getAuth, githubLogin, kakaoLogin, kakaoUnlink, googleLogin, naverLogin, naverUnlink, updateUserPwd, updateUserInfo, updateBlogInfo, deleteUser, login, logout, join, getPublicUser, socialReJoin } from '../../controllers/userControllers.js';
import { authMiddleware } from '../../middlewares/auth.js';
import { imgUploader } from '../../middlewares/upload.js';

const userRouter = express.Router();

userRouter.post("/join", join);
userRouter.post("/join/social", socialReJoin);
userRouter.post("/login", login);
userRouter.get("/logout", authMiddleware, logout);

userRouter.post("/update", authMiddleware, imgUploader('avatars').single("avatar"), updateUserInfo);
userRouter.post("/update/password", authMiddleware, updateUserPwd);
userRouter.post("/update/blog", authMiddleware, updateBlogInfo);
userRouter.get("/delete", authMiddleware, deleteUser);

userRouter.post("/github", githubLogin);

userRouter.post("/kakao", kakaoLogin);
userRouter.post("/kakao/unlink", kakaoUnlink);

userRouter.post("/google", googleLogin);

userRouter.post("/naver", naverLogin);
userRouter.post("/naver/unlink", naverUnlink);

userRouter.get("/auth", authMiddleware, getAuth);
userRouter.post("/public", getPublicUser);
export default userRouter;
