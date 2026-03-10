import express from 'express';
import authRouter from './auth.route.js';
import booksRouter from './books.route.js';
import usersRouter from './users.route.js';
import borrowingsRouter from './borrowings.route.js';
import categoriesRouter from './categories.route.js';
import {
  authenticateToken,
  authorizeAdmin,
} from '../middlewares/auth.controller.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json('Library API is running');
});

router.use('/api', authRouter);
router.use('/api', booksRouter);
router.use('/api', authenticateToken, authorizeAdmin, usersRouter);
router.use('/api', authenticateToken, authorizeAdmin, borrowingsRouter);
router.use('/api', authenticateToken, authorizeAdmin, categoriesRouter);

export default router;
