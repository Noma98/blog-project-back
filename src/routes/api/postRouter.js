import express from 'express';
import { createPost, findPostsByFolderId, deletePost, findPostByPostId, updatePost, findPostsByUserId, findLatestPost, findPostsByQuery } from '../../controllers/postControllers.js';
import { authMiddleware } from '../../middlewares/auth.js';

const postRouter = express.Router();

postRouter.post("/create", authMiddleware, createPost);
postRouter.post("/delete", deletePost);
postRouter.post("/update", updatePost);
postRouter.post("/read", findPostsByFolderId);
postRouter.post("/detail", findPostByPostId);
postRouter.post("/all", findPostsByUserId);
postRouter.post("/latest", findLatestPost);
postRouter.post("/search", findPostsByQuery);
export default postRouter;