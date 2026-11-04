import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.routes';
import weightClassRouter from './routes/weightClass.routes';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/weight-classes', weightClassRouter);

app.listen(PORT, () => {
  console.log(`Backend teče na http://localhost:${PORT}`);
});
