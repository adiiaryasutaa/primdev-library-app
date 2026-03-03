import prisma from '../database/config.database.js'

export const getAllBooks = async (req, res) => {
    const books = await prisma.books.findMany()

    res.json(books)
}

export const getBookById = async (req, res) => {
    const { id } = req.params

    const book = await prisma.books.findUnique({
        where: {
            id: parseInt(id)
        }
    })

    if (!book) {
        return res.status(404).json({ message: 'Book not found' })
    }

    res.json(book)
}

export const createBook = async (req, res) => {
    const bookData = {}
    Object.assign(bookData, req.body)

    const { error } = await prisma.books.create({
        data: bookData
    })

    if (error) {
        return res.status(500).json({ message: 'Error adding book', error })
    }

    res.status(201).json({ message: 'Book added', book: bookData })
}

export const updateBook = async (req, res) => {
    const { id } = req.params

    // Check is book exists before attempting update
    const book = await prisma.books.findUnique({
        where: {
            id: parseInt(id)
        }
    })

    if (!book) {
        return res.status(404).json({ message: 'Book not found' })
    }

    Object.assign(book, req.body)

    // Update the book with new data
    const updatedBook = await prisma.books.update({
        where: {
            id: parseInt(id)
        },
        data: book
    })

    if (!updatedBook) {
        return res.status(500).json({ message: 'Error updating book' })
    }

    res.json({ message: 'Book updated successfully', book: updatedBook })
}

export const deleteBook = async (req, res) => {
    const { id } = req.params

    // check if book exists before attempting delete
    const book = await prisma.books.findUnique({
        where: {
            id: parseInt(id)
        }
    })

    if (!book) {
        return res.status(404).json({ message: 'Book not found' })
    }

    const { error } = await prisma.books.delete({
        where: {
            id: parseInt(id)
        }
    })

    if (error) {
        return res.status(500).json({ message: 'Error deleting book', error })
    }

    res.json({ message: `Book with ID: ${id} deleted` })
}