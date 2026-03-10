import { validationResult } from 'express-validator';
import prisma from '../configs/database.config.js';
import { getFileUrl } from '../helpers/upload.js';

export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.categories.findMany();

    res.json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching categories', error: error.message });
  }
};

export const getBooksByCategory = async (req, res) => {
  const { id } = req.params;

  const category = await prisma.categories.findUnique({
    where: { id: parseInt(id) },
  });

  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }

  try {
    const books = await prisma.books.findMany({
      where: { categoryId: parseInt(id) },
    });

    // add coverUrl to each book
    books.forEach((book) => {
      if (!book.cloudinaryId) {
        book.coverUrl = null;
      }

      book.coverUrl = getFileUrl(book.cloudinaryId);
    });

    res.json(books);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching books for category',
      error: error.message,
    });
  }
};

export const getCategoryById = async (req, res) => {
  const { id } = req.params;

  const category = await prisma.categories.findUnique({
    where: { id: parseInt(id) },
  });

  try {
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching category', error: error.message });
  }
};

export const createCategory = async (req, res) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    return res.status(400).json({ errors: validationErrors.array() });
  }

  const { name } = req.body;

  try {
    const category = await prisma.categories.create({
      data: { name },
    });

    res.status(201).json({ message: 'Category created', category });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error creating category', error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    return res.status(400).json({ errors: validationErrors.array() });
  }

  const { id } = req.params;

  const category = await prisma.categories.findUnique({
    where: { id: parseInt(id) },
  });

  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }

  try {
    const updatedCategory = await prisma.categories.update({
      where: { id: parseInt(id) },
      data: { name: req.body.name },
    });

    res.json({ message: 'Category updated', category: updatedCategory });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error updating category', error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  const category = await prisma.categories.findUnique({
    where: { id: parseInt(id) },
  });

  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }

  try {
    await prisma.categories.delete({ where: { id: parseInt(id) } });
    res.json({ message: `Category with ID: ${id} deleted` });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error deleting category', error: error.message });
  }
};
