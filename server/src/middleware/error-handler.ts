import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'ValidationError',
      message: 'Lengkapi semua jawaban wajib sebelum menyelesaikan modul.',
      issues: error.issues,
    });
    return;
  }

  console.error(error);

  if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') {
    res.status(409).json({
      error: 'Conflict',
      message: 'Data yang sama sudah terdaftar.',
    });
    return;
  }

  const statusCode =
    typeof error === 'object' && error && 'statusCode' in error && typeof error.statusCode === 'number'
      ? error.statusCode
      : 500;

  res.status(statusCode).json({
    error: 'InternalServerError',
    message: statusCode === 500 ? 'Terjadi kesalahan pada server.' : error instanceof Error ? error.message : 'Permintaan tidak dapat diproses.',
  });
};
