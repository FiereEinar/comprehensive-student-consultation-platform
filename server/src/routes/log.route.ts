import express from 'express';
import { getLogsHandler } from '../controllers/log.controller';
import { authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.get('/', authorizeRoles('instructor', 'admin'), getLogsHandler);

export default router;
