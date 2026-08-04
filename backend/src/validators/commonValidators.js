import { param, query } from 'express-validator';

export const idParamValidator = [param('id').trim().notEmpty().withMessage('ID parameter is required.')];

export const listQueryValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.'),
  query('search').optional().isString().trim(),
  query('sortBy').optional().isString().trim(),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('sortOrder must be asc or desc.'),
];