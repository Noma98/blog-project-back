import express from 'express';
import { getCreate } from '../../controllers/folderControllers.js';
import { authMiddleware } from '../../middlewares/auth.js';

const folderRouter = express.Router();
folderRouter.get("/create", authMiddleware, getCreate);


export default folderRouter;