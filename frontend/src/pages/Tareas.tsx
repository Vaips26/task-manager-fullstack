import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  estado: 'pendiente' | 'en_progreso' | 'completado';
}

const ESTADOS = ['pendiente', 'en_progreso', 'completado'] as const;
const ETIQUETAS: Record<string, string> = {
  pendiente: '📋 Pendiente',
  en_progreso: '⚙️ En progreso',
  completado: '✅ Completado',
};

export default function Tareas() {
  const { tableroId } = useParams();
  const navigate = useNavigate();
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cargando, setCargando] = useState(true);

  const cargarTareas = async () => {
    try {
      const res = await api.get(`/api/tareas/tablero/${tableroId}`);
      setTareas(res.data);
    } catch {
      console.error('Error cargando tareas');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarTareas(); }, [tableroId]);

  const crearTarea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;
    try {
      await api.post('/api/tareas', { titulo, descripcion, tablero_id: Number(tableroId) });
      setTitulo('');
      setDescripcion('');
      cargarTareas();
    } catch {
      console.error('Error creando tarea');
    }
  };

  const cambiarEstado = async (id: number, estado: string) => {
    try {
      await api.patch(`/api/tareas/${id}/estado`, { estado });
      cargarTareas();
    } catch {
      console.error('Error actualizando estado');
    }
  };

  const eliminarTarea = async (id: number) => {
    try {
      await api.delete(`/api/tareas/${id}`);
      cargarTareas();
    } catch {
      console.error('Error eliminando tarea');
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <button className="btn-secondary" onClick={() => navigate('/tableros')}>← Volver</button>
        <h1>Tareas del tablero</h1>
      </header>

      <form className="form-tarea" onSubmit={crearTarea}>
        <input type="text" placeholder="Título de la tarea..." value={titulo}
          onChange={e => setTitulo(e.target.value)} required />
        <input type="text" placeholder="Descripción (opcional)" value={descripcion}
          onChange={e => setDescripcion(e.target.value)} />
        <button type="submit">+ Agregar tarea</button>
      </form>

      {cargando ? <p>Cargando...</p> : (
        <div className="kanban">
          {ESTADOS.map(estado => (
            <div key={estado} className="columna">
              <h3>{ETIQUETAS[estado]}</h3>
              {tareas.filter(t => t.estado === estado).map(tarea => (
                <div key={tarea.id} className="tarea-card">
                  <p className="tarea-titulo">{tarea.titulo}</p>
                  {tarea.descripcion && <p className="tarea-desc">{tarea.descripcion}</p>}
                  <div className="tarea-acciones">
                    <select value={tarea.estado}
                      onChange={e => cambiarEstado(tarea.id, e.target.value)}>
                      {ESTADOS.map(e => <option key={e} value={e}>{ETIQUETAS[e]}</option>)}
                    </select>
                    <button className="btn-danger-sm" onClick={() => eliminarTarea(tarea.id)}>✕</button>
                  </div>
                </div>
              ))}
              {tareas.filter(t => t.estado === estado).length === 0 && (
                <p className="columna-vacia">Sin tareas</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}