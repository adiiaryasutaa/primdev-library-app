import { validationResult } from 'express-validator';
import prisma from '../database/config.database.js';
import { deleteFile, getFileUrl, uploadFile } from '../helpers/upload.js';

export const getAllBooks = async (req, res) => {
  // /api/books?category=1
  const { category: categoryId } = req.params;
  let where = {};

  try {
    if (categoryId) {
      const category = await prisma.categories.findUnique({
        where: { id: parseInt(categoryId) },
      });

      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      where.categoryId = parseInt(categoryId);
    }

    const books = await prisma.books.findMany(where);

    // add coverUrl to each book
    books.forEach((book) => {
      if (!book.cloudinaryId) {
        book.coverUrl = null;
      }

      book.coverUrl = getFileUrl(book.cloudinaryId);
    });

    res.json(books);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching books', error: error.message });
  }
};

export const getBookById = async (req, res) => {
  const { id } = req.params;

  try {
    const book = await prisma.books.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.cloudinaryId) {
      book.coverUrl = getFileUrl(book.cloudinaryId);
    } else {
      book.coverUrl = null;
    }

    res.json(book);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching book', error: error.message });
  }
};

export const createBook = async (req, res) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    return res.status(400).json({ errors: validationErrors.array() });
  }

  const bookData = {
    title: req.body.title,
    author: req.body.author,
    year: req.body.year,
  };

  const cover = req.file;

  try {
    if (cover) {
      const result = await uploadFile(cover);

      bookData.cloudinaryId = result.public_id;
    }

    const book = await prisma.books.create({
      data: bookData,
    });

    if (book.cloudinaryId) {
      book.coverUrl = getFileUrl(book.cloudinaryId);
    } else {
      book.coverUrl = null;
    }

    res.status(201).json({ message: 'Book added', book });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error creating book', error: error.message });
  }
};

export const updateBook = async (req, res) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    return res.status(400).json({ errors: validationErrors.array() });
  }

  const { id } = req.params;

  // Check is book exists before attempting update
  const book = await prisma.books.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  const bookData = {
    title: req.body.title,
    author: req.body.author,
    year: req.body.year,
  };

  const cover = req.file;

  try {
    if (cover) {
      // delete old image if exists
      if (book.cloudinaryId) {
        const deleted = await deleteFile(book.cloudinaryId);

        if (deleted.result !== 'ok') {
          throw new Error('Failed to upload image');
        }
      }

      const result = await uploadFile(cover);
      book.cloudinaryId = result.public_id;
    }

    const updatedBook = await prisma.books.update({
      where: {
        id: parseInt(id),
      },
      data: bookData,
    });

    if (!updatedBook) {
      return res.status(500).json({ message: 'Error updating book' });
    }

    res.json({ message: 'Book updated successfully', book: updatedBook });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error updating book', error: error.message });
  }
};

export const deleteBook = async (req, res) => {
  const { id } = req.params;

  // check if book exists before attempting delete
  const book = await prisma.books.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  try {
    if (book.cloudinaryId) {
      const deleted = await deleteFile(book.cloudinaryId);

      if (deleted.result !== 'ok') {
        throw new Error('Failed to delete image');
      }
    }

    const { error } = await prisma.books.delete({
      where: {
        id: parseInt(id),
      },
    });

    if (error) {
      return res.status(500).json({ message: 'Error deleting book', error });
    }

    res.json({ message: `Book with ID: ${id} deleted` });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error deleting book', error: error.message });
  }
};
