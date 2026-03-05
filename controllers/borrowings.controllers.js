import prisma from '../database/config.database.js';

export const getAllBorrowings = async (req, res) => {
  try {
    const borrowings = await prisma.borrowings.findMany({
      include: {
        borrower: { select: { id: true, name: true, email: true } },
        book: true,
      },
    });

    res.json(borrowings);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching borrowings', error: error.message });
  }
};

export const getBorrowingById = async (req, res) => {
  const { id } = req.params;

  try {
    const borrowing = await prisma.borrowings.findUnique({
      where: { id: parseInt(id) },
      include: {
        borrower: { select: { id: true, name: true, email: true } },
        book: true,
      },
    });

    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing not found' });
    }

    res.json(borrowing);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching borrowing', error: error.message });
  }
};

export const createBorrowing = async (req, res) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    return res.status(400).json({ errors: validationErrors.array() });
  }

  const { bookId } = req.body;
  const userId = req.user.id;

  const book = await prisma.books.findUnique({
    where: { id: parseInt(bookId) },
    select: { available: true },
  });

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  if (!book.available) {
    return res
      .status(400)
      .json({ message: 'Book is not available for borrowing' });
  }

  try {
    const borrowing = await prisma.$transaction(async (tx) => {
      const borrowing = await tx.borrowings.create({
        data: { userId, bookId: parseInt(bookId) },
        include: {
          borrower: { select: { id: true, name: true, email: true } },
          book: true,
        },
      });

      await tx.books.update({
        where: { id: parseInt(bookId) },
        data: {
          available: false,
        },
      });

      return borrowing;
    });

    res.status(201).json({ message: 'Borrowing created', borrowing });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error creating borrowing', error: error.message });
  }
};

export const returnBook = async (req, res) => {
  const { id } = req.params;

  const borrowing = await prisma.borrowings.findUnique({
    where: { id: parseInt(id) },
  });

  if (!borrowing) {
    return res.status(404).json({ message: 'Borrowing not found' });
  }

  if (borrowing.returned_at) {
    return res.status(400).json({ message: 'Book already returned' });
  }

  try {
    const updatedBorrowing = await prisma.$transaction(async (tx) => {
      const updatedBorrowing = await tx.borrowings.update({
        where: { id: parseInt(id) },
        data: { returned_at: new Date() },
        include: {
          borrower: { select: { id: true, name: true, email: true } },
          book: true,
        },
      });

      await tx.books.update({
        where: { id: borrowing.bookId },
        data: { available: true },
      });

      return updatedBorrowing;
    });

    res.json({
      message: 'Book returned successfully',
      borrowing: updatedBorrowing,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error returning book', error: error.message });
  }
};

export const deleteBorrowing = async (req, res) => {
  const { id } = req.params;

  const borrowing = await prisma.borrowings.findUnique({
    where: { id: parseInt(id) },
    include: {
      borrower: { select: { id: true, name: true, email: true } },
      book: true,
    },
  });

  if (!borrowing) {
    return res.status(404).json({ message: 'Borrowing not found' });
  }

  try {
    prisma.$transaction(async (tx) => {
      await tx.borrowings.delete({ where: { id: parseInt(id) } });

      if (!borrowing.returned_at) {
        await tx.books.update({
          where: { id: borrowing.bookId },
          data: { available: true },
        });
      }
    });

    res.json({ message: `Borrowing with ID: ${id} deleted` });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error deleting borrowing', error: error.message });
  }
};
