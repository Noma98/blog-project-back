import express from 'express';
import { createPost, findPostsByFolderId, deletePost, findPostByPostId, updatePost, findPostsByUserId, findLatestPost, findPostsByQuery, findAllPosts, findAllResults } from '../../controllers/postControllers.js';
import { authMiddleware } from '../../middlewares/auth.js';

const postRouter = express.Router();

postRouter.post("/create", authMiddleware, createPost);
postRouter.post("/delete", authMiddleware, deletePost);
postRouter.post("/update", authMiddleware, updatePost);
postRouter.post("/read", findPostsByFolderId);
postRouter.post("/detail", findPostByPostId);
postRouter.post("/user", findPostsByUserId);
postRouter.get("/all", findAllPosts);
postRouter.post("/latest", findLatestPost);
postRouter.post("/search", findPostsByQuery);
postRouter.post("/search/global", findAllResults);
export default postRouter;