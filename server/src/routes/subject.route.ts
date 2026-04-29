import express from 'express';
import { createSubject, getSubjects, updateSubject, deleteSubject, toggleInstructorSubject } from '../controllers/subject.controller';
import { authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.post('/', authorizeRoles('admin', 'instructor'), createSubject);
router.get('/', getSubjects);
router.patch('/:id', authorizeRoles('admin', 'instructor'), updateSubject);
router.delete('/:id', authorizeRoles('admin', 'instructor'), deleteSubject);
router.post('/:id/toggle-instructor', authorizeRoles('instructor'), toggleInstructorSubject);

export default router;
