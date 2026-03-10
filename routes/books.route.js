import { Router } from 'express';
import { body } from 'express-validator';
import {
  createBook,
  deleteBook,
  getAllBooks,
  getBookById,
  updateBook,
} from '../controllers/books.controller.js';
import multer from 'multer';
import {
  authenticateToken,
  authorizeAdmin,
} from '../middlewares/auth.controller.js';

const router = Router();

const bookValidation = [
  body('title')
    .isString()
    .withMessage('Title must be a string')
    .notEmpty()
    .withMessage('Title is required'),
  body('author')
    .isString()
    .withMessage('Author must be a string')
    .notEmpty()
    .withMessage('Author is required'),
  body('year')
    .isNumeric({ min: 1880 })
    .withMessage('Year must be a positive integer')
    .notEmpty()
    .withMessage('Year is required')
    .toInt(),
  body('categoryId')
    .optional()
    .isNumeric()
    .withMessage('Category ID must be a number')
    .toInt(),
  body('cover').custom((value, { req }) => {
    const cover = req.file;

    console.log('Validating cover:', cover);

    if (!cover) {
      return true; // No file uploaded, so skip validation
    }

    // Check file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(cover.mimetype)) {
      throw new Error('Cover must be a PNG or JPEG image');
    }

    // Check file size (max 1MB)
    if (cover.size >= 1 * 1024 * 1024) {
      throw new Error('Cover must be less than 1MB');
    }

    return true;
  }),
];

const updateBookValidation = [
  body('title')
    .optional()
    .isString()
    .withMessage('Title must be a string')
    .notEmpty()
    .withMessage('Title is required'),
  body('author')
    .optional()
    .isString()
    .withMessage('Author must be a string')
    .notEmpty()
    .withMessage('Author is required'),
  body('year')
    .optional()
    .isNumeric({ min: 1880 })
    .withMessage('Year must be a positive integer')
    .notEmpty()
    .withMessage('Year is required')
    .toInt(),
  body('categoryId')
    .optional()
    .isNumeric()
    .withMessage('Category ID must be a number')
    .toInt(),
  body('cover').custom((value, { req }) => {
    const cover = req.file;

    console.log('Validating cover:', cover);

    if (!cover) {
      return true; // No file uploaded, so skip validation
    }

    // Check file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(cover.mimetype)) {
      throw new Error('Cover must be a PNG or JPEG image');
    }

    // Check file size (max 1MB)
    if (cover.size >= 1 * 1024 * 1024) {
      throw new Error('Cover must be less than 1MB');
    }

    return true;
  }),
];

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/books', getAllBooks);
router.get('/books/:id', authenticateToken, getBookById);
router.post(
  '/books',
  authenticateToken,
  authorizeAdmin,
  upload.single('cover'),
  bookValidation,
  createBook,
);
router.put(
  '/books/:id',
  authenticateToken,
  authorizeAdmin,
  upload.single('cover'),
  updateBookValidation,
  updateBook,
);
router.delete('/books/:id', authenticateToken, authorizeAdmin, deleteBook);

export default router;
