import express from 'express';
import { updateSingleAvailability, deleteSingleAvailability } from '../controllers/availability.controller';

const router = express.Router();
router.put('/:availabilityID', updateSingleAvailability);
router.delete('/:availabilityID', deleteSingleAvailability); // <--- Add this line

export default router;
