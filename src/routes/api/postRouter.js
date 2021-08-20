import express from 'express';
import { createPost, findPostsByFolderId, deletePost, findPostByPostId, updatePost, findPostsByUserId, findLatestPost, findPostsByQuery, findAllPosts, findAllResults, convertImage } from '../../controllers/postControllers.js';
import { authMiddleware } from '../../middlewares/auth.js';
import { imgUploader } from '../../middlewares/upload.js';

const postRouter = express.Router();

postRouter.post("/create", authMiddleware, imgUploader('thumbnails').single('thumbnail'), createPost);
postRouter.post("/delete", authMiddleware, deletePost);
postRouter.post("/update", authMiddleware, imgUploader('thumbnails').single('thumbnail'), updatePost);
postRouter.post("/read", findPostsByFolderId);
postRouter.post("/detail", findPostByPostId);
postRouter.post("/user", findPostsByUserId);
postRouter.get("/all", findAllPosts);
postRouter.post("/latest", findLatestPost);
postRouter.post("/search", findPostsByQuery);
postRouter.post("/search/global", findAllResults);
postRouter.post("/image", imgUploader('images').single('image'), convertImage);
export default postRouter;