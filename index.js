import 'dotenv/config';
import express from 'express';
import router from './routes/index.routes.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(router);

app.listen(port, () => {
  console.log(`Library API is running url: http://localhost:${port}`);
});
