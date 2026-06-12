import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { asyncHandler } from '../middleware/async-handler';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get(
  '/lookup',
  requireAuth,
  asyncHandler(async (req, res) => {
    const query = z.string().trim().min(2).max(100).parse(req.query.query);
    const schools = await prisma.school.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      orderBy: { name: 'asc' },
      take: 8,
      select: {
        id: true,
        name: true,
        slug: true,
        classes: {
          orderBy: [{ grade: 'asc' }, { name: 'asc' }],
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
      },
    });

    res.json({ schools });
  }),
);

router.get(
  '/join/:joinCode',
  asyncHandler(async (req, res) => {
    const joinCode = z.string().min(3).parse(req.params.joinCode).toUpperCase();
    const school = await prisma.school.findUnique({
      where: { joinCode },
      select: {
        id: true,
        name: true,
        slug: true,
        classes: {
          orderBy: [{ grade: 'asc' }, { name: 'asc' }],
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
      },
    });

    if (!school) {
      res.status(404).json({
        error: 'SchoolNotFound',
        message: 'Kode sekolah tidak ditemukan.',
      });
      return;
    }

    res.json({ school });
  }),
);

router.get(
  '/',
  requireRole('super_admin'),
  asyncHandler(async (_req, res) => {
    const schools = await prisma.school.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    res.json({ schools });
  }),
);

router.get(
  '/:schoolId/classes',
  requireRole('super_admin'),
  asyncHandler(async (req, res) => {
    const schoolId = z.string().min(1).parse(req.params.schoolId);
    const classes = await prisma.schoolClass.findMany({
      where: { schoolId },
      orderBy: [{ grade: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        grade: true,
      },
    });

    res.json({ classes });
  }),
);

export const schoolsRouter = router;
