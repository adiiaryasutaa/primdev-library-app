import 'dotenv/config';
import express from 'express';
import router from './routes/index.route.js';

const app = express();

app.use(express.json());
app.use(router);

if (process.env.ENV !== 'production') {
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Library API is running url: http://localhost:${port}`);
  });
}

export default app;
