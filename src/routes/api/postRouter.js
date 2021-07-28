import express from 'express';
import { postCreate, postsRead, postDelete, postDetail, postUpdate } from '../../controllers/postControllers.js';
import { authMiddleware } from '../../middlewares/auth.js';

const postRouter = express.Router();

postRouter.post("/create", authMiddleware, postCreate);
postRouter.post("/read", postsRead);
postRouter.post("/delete", postDelete);
postRouter.post("/detail", postDetail);
postRouter.post("/update", postUpdate);
export default postRouter;