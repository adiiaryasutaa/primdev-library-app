import { Router } from 'express';
import { body } from 'express-validator';
import {
  createBorrowing,
  deleteBorrowing,
  getAllBorrowings,
  getBorrowingById,
  returnBook,
} from '../controllers/borrowings.controller.js';

const router = Router();

const borrowingValidation = [
  body('bookId')
    .isInt()
    .withMessage('Book ID must be an integer')
    .notEmpty()
    .withMessage('Book ID is required'),
  body('userId')
    .isInt()
    .withMessage('User ID must be an integer')
    .notEmpty()
    .withMessage('User ID is required'),
];

router.get('/borrowings', getAllBorrowings);
router.get('/borrowings/:id', getBorrowingById);
router.post('/borrowings', borrowingValidation, createBorrowing);
router.patch('/borrowings/:id/return', returnBook);
router.delete('/borrowings/:id', deleteBorrowing);

export default router;
