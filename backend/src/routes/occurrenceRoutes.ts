import { Router } from 'express';
import {
  listOccurrences,
  listMyOccurrences,
  getOccurrence,
  createOccurrence,
  updateStatus,
  deleteOccurrence,
  getStats,
  addComment,
  deleteComment,
  toggleVote,
  exportCSV,
} from '../controllers/occurrenceController';
import { upload } from '../middleware/upload';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/stats', getStats);
router.get('/my', requireAuth, listMyOccurrences);
router.get('/export', exportCSV);
router.get('/', listOccurrences);
router.get('/:id', getOccurrence);
router.post('/', requireAuth, upload.single('image'), createOccurrence);
router.patch('/:id/status', updateStatus);
router.delete('/:id', requireAuth, deleteOccurrence);

router.post('/:id/comments', requireAuth, addComment);
router.delete('/:id/comments/:commentId', requireAuth, deleteComment);
router.post('/:id/vote', requireAuth, toggleVote);

export default router;
