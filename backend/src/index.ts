import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db/index';
import authRoutes from './routes/auth';
import tableroRoutes from './routes/tableros';
import tareaRoutes from './routes/tareas';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tableros', tableroRoutes);
app.use('/api/tareas', tareaRoutes);

app.get('/', (_req, res) => {
  res.json({ status: 'Gestor de tareas API corriendo' });
});

const iniciar = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Conectado a PostgreSQL');
    app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error);
    process.exit(1);
  }
};

iniciar();