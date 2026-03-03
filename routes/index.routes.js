import express from 'express'
import booksRouter from './books.routes.js'

const router = express.Router()

router.get('/', (req, res) => {
    res.send('Hello World!')
})

router.use(booksRouter)

export default router