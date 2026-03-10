import express from 'express';
import { body } from 'express-validator';
import { login, register } from '../controllers/auth.controller.js';

const router = express.Router();

const registerValidation = [
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
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Email is not valid')
    .notEmpty()
    .withMessage('Email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

export default router;
