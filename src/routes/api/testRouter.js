import express from 'express';
import { testController } from '../../controllers/testControllers.js';
testController

const testRouter = express.Router();

testRouter.get("/test", testController);

export default testRouter;
