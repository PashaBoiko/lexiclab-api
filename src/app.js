import express from 'express';
import cors from 'cors';
import mongoose from './db/mongoose.js';

import dictionaryRoutes from './routes/dictionary.js';
import authRoutes from './routes/auth.js';
import quizRoutes from './routes/quiz.js';
import configRoutes from './routes/config.js';
import profileRoutes from './routes/profile.js';
import statisticRoutes from './routes/statistic.js';

const app = express();

mongoose.once('open', () => {
  console.log('Successful connection to mongoDB');
});

app.get('/', (req, res) => {
  res.send("Hello word!!");
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Разрешить доступ с любого источника (здесь "*")
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Разрешенные HTTP-методы
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Разрешенные заголовки

  // Если это запрос с методом "OPTIONS", вернуть успешный статус
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use(dictionaryRoutes);
app.use(authRoutes);
app.use(quizRoutes);
app.use(configRoutes);
app.use(profileRoutes);
app.use(statisticRoutes);

export default app;