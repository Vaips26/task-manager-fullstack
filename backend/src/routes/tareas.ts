import { Router, Response } from 'express';
import pool from '../db/index';
import { verificarToken, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(verificarToken);

router.get('/tablero/:tableroId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const resultado = await pool.query(
      `SELECT t.* FROM tareas t
       JOIN tableros tb ON t.tablero_id = tb.id
       WHERE t.tablero_id = $1 AND tb.usuario_id = $2
       ORDER BY t.created_at DESC`,
      [req.params.tableroId, req.usuarioId]
    );
    res.json(resultado.rows);
  } catch {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { titulo, descripcion, tablero_id } = req.body;
  if (!titulo || !tablero_id) { res.status(400).json({ error: 'Titulo y tablero_id requeridos' }); return; }

  try {
    const resultado = await pool.query(
      'INSERT INTO tareas (titulo, descripcion, tablero_id) VALUES ($1, $2, $3) RETURNING *',
      [titulo, descripcion, tablero_id]
    );
    res.status(201).json(resultado.rows[0]);
  } catch {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.patch('/:id/estado', async (req: AuthRequest, res: Response): Promise<void> => {
  const { estado } = req.body;
  try {
    const resultado = await pool.query(
      'UPDATE tareas SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, req.params.id]
    );
    res.json(resultado.rows[0]);
  } catch {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await pool.query('DELETE FROM tareas WHERE id = $1', [req.params.id]);
    res.json({ mensaje: 'Tarea eliminada' });
  } catch {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;