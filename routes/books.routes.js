import { Router } from 'express'
import { Joi, validate } from 'express-validation'
import {
    createBook,
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook
} from '../controllers/books.controllers.js'

const router = Router()

const bookValidation = {
    body: Joi.object({
        title: Joi.string().required(),
        author: Joi.string().required(),
        year: Joi.number().integer().required()
    })
}

const updateBookValidation = {
    body: Joi.object({
        title: Joi.string(),
        author: Joi.string(),
        year: Joi.number().integer()
    })
}

router.get('/books', getAllBooks)
router.get('/books/:id', getBookById)
router.post('/books', validate(bookValidation), createBook)
router.put('/books/:id', validate(updateBookValidation), updateBook)
router.delete('/books/:id', deleteBook)

export default router