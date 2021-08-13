import express from 'express';
import { createFolder, updateFolderName, deleteFolder } from '../../controllers/folderControllers.js';
import { authMiddleware } from '../../middlewares/auth.js';

const folderRouter = express.Router();
folderRouter.get("/create", authMiddleware, createFolder);
folderRouter.post("/edit", authMiddleware, updateFolderName);
folderRouter.post("/delete", authMiddleware, deleteFolder);

export default folderRouter;