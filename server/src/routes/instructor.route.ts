import express from 'express';
import { getInstructors } from '../controllers/instructor.controller';

const router = express.Router();

router.get('/', getInstructors);

export default router;
