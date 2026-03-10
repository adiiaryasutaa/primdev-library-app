import { Router } from 'express';
import { body } from 'express-validator';
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getBooksByCategory,
  getCategoryById,
  updateCategory,
} from '../controllers/categories.controller.js';

const router = Router();

const categoryValidation = [
  body('name')
    .isString()
    .withMessage('Name must be a string')
    .notEmpty()
    .withMessage('Name is required'),
];

const updateCategoryValidation = [
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .notEmpty()
    .withMessage('Name is required'),
];

router.get('/categories', getAllCategories);
router.get('/categories/:id', getCategoryById);
router.get('/categories/:id/books', getBooksByCategory);
router.post('/categories', categoryValidation, createCategory);
router.put('/categories/:id', updateCategoryValidation, updateCategory);
router.delete('/categories/:id', deleteCategory);

export default router;
