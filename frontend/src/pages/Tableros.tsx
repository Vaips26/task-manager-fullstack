import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

interface Tablero {
  id: number;
  nombre: string;
  created_at: string;
}

export default function Tableros() {
  const [tableros, setTableros] = useState<Tablero[]>([]);
  const [nombre, setNombre] = useState('');
  const [cargando, setCargando] = useState(true);
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const cargarTableros = async () => {
    try {
      const res = await api.get('/api/tableros');
      setTableros(res.data);
    } catch {
      console.error('Error cargando tableros');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarTableros(); }, []);

  const crearTablero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    try {
      await api.post('/api/tableros', { nombre });
      setNombre('');
      cargarTableros();
    } catch {
      console.error('Error creando tablero');
    }
  };

  const eliminarTablero = async (id: number) => {
    if (!confirm('¿Eliminar este tablero y todas sus tareas?')) return;
    try {
      await api.delete(`/api/tableros/${id}`);
      cargarTableros();
    } catch {
      console.error('Error eliminando tablero');
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>📋 Mis Tableros</h1>
        <div className="header-right">
          <span>Hola, {usuario?.nombre}</span>
          <button className="btn-secondary" onClick={logout}>Cerrar sesión</button>
        </div>
      </header>

      <form className="form-inline" onSubmit={crearTablero}>
        <input type="text" placeholder="Nombre del tablero..." value={nombre}
          onChange={e => setNombre(e.target.value)} />
        <button type="submit">+ Crear tablero</button>
      </form>

      {cargando ? <p>Cargando...</p> : (
        <div className="grid">
          {tableros.length === 0 && <p className="vacio">No tienes tableros aún. ¡Crea uno!</p>}
          {tableros.map(t => (
            <div key={t.id} className="card" onClick={() => navigate(`/tableros/${t.id}`)}>
              <h3>{t.nombre}</h3>
              <p className="fecha">{new Date(t.created_at).toLocaleDateString('es-MX')}</p>
              <button className="btn-danger" onClick={e => { e.stopPropagation(); eliminarTablero(t.id); }}>
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}