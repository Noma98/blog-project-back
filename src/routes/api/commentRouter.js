import express from 'express';
import { createComment, deleteComment } from '../../controllers/commentControllers';
import { authMiddleware } from '../../middlewares/auth';

const commentRouter = express.Router();
commentRouter.post("/create", authMiddleware, createComment);
commentRouter.post("/delete", authMiddleware, deleteComment);

export default commentRouter;