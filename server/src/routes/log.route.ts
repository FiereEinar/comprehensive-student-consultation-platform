import express from 'express';
import { getLogsHandler } from '../controllers/log.controller';

const router = express.Router();

router.get('/', getLogsHandler);

export default router;
