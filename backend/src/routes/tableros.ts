import { Router, Response } from 'express';
import pool from '../db/index';
import { verificarToken, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(verificarToken);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const resultado = await pool.query(
      'SELECT * FROM tableros WHERE usuario_id = $1 ORDER BY created_at DESC',
      [req.usuarioId]
    );
    res.json(resultado.rows);
  } catch {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { nombre } = req.body;
  if (!nombre) { res.status(400).json({ error: 'El nombre es requerido' }); return; }

  try {
    const resultado = await pool.query(
      'INSERT INTO tableros (nombre, usuario_id) VALUES ($1, $2) RETURNING *',
      [nombre, req.usuarioId]
    );
    res.status(201).json(resultado.rows[0]);
  } catch {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await pool.query('DELETE FROM tableros WHERE id = $1 AND usuario_id = $2', [req.params.id, req.usuarioId]);
    res.json({ mensaje: 'Tablero eliminado' });
  } catch {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;