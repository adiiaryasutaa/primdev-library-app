import { Router } from 'express';
import { body } from 'express-validator';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserBorrowings,
  getUserById,
  updateUser,
} from '../controllers/users.controllers.js';

const router = Router();

const userValidation = [
  body('name')
    .isString()
    .withMessage('Name must be a string')
    .notEmpty()
    .withMessage('Name is required'),
  body('email')
    .isEmail()
    .withMessage('Email is not valid')
    .notEmpty()
    .withMessage('Email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .notEmpty()
    .withMessage('Password is required'),
  body('role')
    .isIn(['ADMIN', 'USER'])
    .withMessage('Role must be either ADMIN or USER')
    .notEmpty()
    .withMessage('Role is required'),
];

const updateUserValidation = [
  body('name').optional().isString().withMessage('Name must be a string'),
  body('email').optional().isEmail().withMessage('Email is not valid'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['ADMIN', 'USER'])
    .withMessage('Role must be either ADMIN or USER'),
];

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.get('/users/:id/borrows', getUserBorrowings);
router.post('/users', userValidation, createUser);
router.put('/users/:id', updateUserValidation, updateUser);
router.delete('/users/:id', deleteUser);

export default router;
