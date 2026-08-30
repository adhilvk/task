import express from 'express';

import { LOCAL_ANIMALS } from './animals/animals.data';

const app = express();

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/animals', (req, res) => {
  const name =
    typeof req.query.name === 'string' ? req.query.name.toLowerCase() : '';

  const animals = name
    ? LOCAL_ANIMALS.filter((animal) =>
        animal.name.toLowerCase().includes(name),
      )
    : LOCAL_ANIMALS;

  res.json(animals);
});

if (!process.env.VERCEL) {
  const port = Number(process.env.PORT ?? 3000);
  app.listen(port);
}

export default app;
