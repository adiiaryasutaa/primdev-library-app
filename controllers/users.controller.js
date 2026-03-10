import bcrypt from 'bcryptjs';
import 'dotenv/config.js';
import { validationResult } from 'express-validator';
import prisma from '../configs/database.config.js';
import { parse } from 'dotenv';

export const getAllUsers = async (req, res) => {
  const users = await prisma.users.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  res.json(users);
};

export const getUserById = async (req, res) => {
  const { id } = req.params;

  const user = await prisma.users.findUnique({
    where: { id: parseInt(id) },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
};

export const getUserBorrowings = async (req, res) => {
  const { id } = req.params;

  const user = await prisma.users.findUnique({
    where: { id: parseInt(id) },
    select: { borrowings: { include: { book: true } } },
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user.borrowings);
};

export const createUser = async (req, res) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    return res.status(400).json({ errors: validationErrors.array() });
  }

  const { name, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: { name, email, password: hashedPassword, ...(role && { role }) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({ message: 'User created', user });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error creating user', error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    return res.status(400).json({ errors: validationErrors.array() });
  }

  const { id } = req.params;

  const user = await prisma.users.findUnique({
    where: { id: parseInt(id) },
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const updateData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  if (req.body.password) {
    updateData.password = await bcrypt.hash(
      req.body.password,
      parseInt(process.env.BCRYPT_SALT_ROUNDS),
    );
  }

  try {
    const updatedUser = await prisma.users.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({ message: 'User updated', user: updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error updating user', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  const user = await prisma.users.findUnique({
    where: { id: parseInt(id) },
    select: { id: true },
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  try {
    await prisma.users.delete({ where: { id: parseInt(id) } });

    res.json({ message: `User with ID: ${id} deleted` });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error deleting user', error: error.message });
  }
};
