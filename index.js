import express from 'express'
import router from './routes/index.routes.js'
import { ValidationError } from 'express-validation'

const app = express()
const port = 3000

app.use(express.json())
app.use(router)

app.use(function (err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(err)
  }

  return res.status(500).json(err)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
