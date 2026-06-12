import { Router } from 'express';
import { requireRole } from '../middleware/auth';

const router = Router();

router.get('/student', requireRole('student'), (req, res) => {
  res.json({
    area: 'student',
    user: req.user,
  });
});

router.get('/teacher', requireRole('teacher_bk'), (req, res) => {
  res.json({
    area: 'teacher',
    user: req.user,
  });
});

router.get('/admin', requireRole('school_admin', 'super_admin'), (req, res) => {
  res.json({
    area: 'admin',
    user: req.user,
  });
});

export const protectedRouter = router;
