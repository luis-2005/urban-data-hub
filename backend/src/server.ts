import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { connectDatabase } from './config/database';
import occurrenceRoutes from './routes/occurrenceRoutes';
import authRoutes from './routes/authRoutes';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/occurrences', occurrenceRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start(): Promise<void> {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

start();
