import express from 'express';
import { getCreate, postEdit } from '../../controllers/folderControllers.js';
import { authMiddleware } from '../../middlewares/auth.js';

const folderRouter = express.Router();
folderRouter.get("/create", authMiddleware, getCreate);
folderRouter.post("/edit", postEdit);

export default folderRouter;