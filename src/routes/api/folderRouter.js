import express from 'express';
import { getCreate, postEdit, postDelete } from '../../controllers/folderControllers.js';
import { authMiddleware } from '../../middlewares/auth.js';

const folderRouter = express.Router();
folderRouter.get("/create", authMiddleware, getCreate);
folderRouter.post("/edit", postEdit);
folderRouter.post("/delete", authMiddleware, postDelete);

export default folderRouter;