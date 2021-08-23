import express from 'express';
import { createComment } from '../../controllers/commentControllers';

const commentRouter = express.Router();
commentRouter.post("/create", createComment);

export default commentRouter;