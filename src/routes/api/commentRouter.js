import express from 'express';
import { createComment } from '../../controllers/commentControllers';
import { authMiddleware } from '../../middlewares/auth';

const commentRouter = express.Router();
commentRouter.post("/create", authMiddleware, createComment);

export default commentRouter;