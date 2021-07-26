import express from 'express';
import { postNewPost } from '../../controllers/postControllers.js';
import { authMiddleware } from '../../middlewares/auth.js';

const postRouter = express.Router();

postRouter.post("/create", authMiddleware, postNewPost);

export default postRouter;