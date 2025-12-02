import express from 'express';
import { getLogsHandler } from '../controllers/log.controller';
import { hasRole } from '../middlewares/authorization.middleware';
import { MODULES } from '../constants';

const router = express.Router();

router.get('/', hasRole([MODULES.READ_LOG]), getLogsHandler);

export default router;
