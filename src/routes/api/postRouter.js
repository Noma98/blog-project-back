import express from 'express';
import { postCreate, postRead, postDelete, postDetail } from '../../controllers/postControllers.js';
import { authMiddleware } from '../../middlewares/auth.js';

const postRouter = express.Router();

postRouter.post("/create", authMiddleware, postCreate);
postRouter.post("/read", postRead);
postRouter.post("/delete", postDelete);
postRouter.post("/detail", postDetail);
export default postRouter;