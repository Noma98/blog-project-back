import express from 'express';
import { postCreate, postRead } from '../../controllers/postControllers.js';
import { authMiddleware } from '../../middlewares/auth.js';

const postRouter = express.Router();

postRouter.post("/create", authMiddleware, postCreate);
postRouter.post("/read", postRead);

export default postRouter;