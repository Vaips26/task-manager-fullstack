#  Gestor de Tareas — Full Stack App

Aplicación de gestión de tareas estilo Kanban con autenticación de usuarios, tableros personalizados y organización de tareas por estado. Construida con un stack moderno de producción y completamente dockerizada.

>  **Cualquiera puede correrla localmente con un solo comando** — solo necesitas Docker instalado.

---


---

##  Funcionalidades

-  Registro e inicio de sesión con autenticación JWT
-  Crear, ver y eliminar tableros personalizados
-  Crear tareas con título y descripción dentro de cada tablero
-  Cambiar estado de tareas: **Pendiente → En progreso → Completado**
-  Eliminar tareas
-  Datos persistentes por usuario (cada quien ve solo sus tableros)

---

##  Stack tecnológico

### Frontend
- **React 18** con **TypeScript** — interfaz de usuario
- **React Router DOM** — navegación entre pantallas sin recarga
- **Axios** — peticiones HTTP al backend con token JWT automático
- **Vite** — bundler y servidor de desarrollo
- **Nginx** — servidor estático en producción (dentro del contenedor)

### Backend
- **Node.js** con **TypeScript**
- **Express** — framework web para la API REST
- **PostgreSQL 16** — base de datos relacional
- **bcryptjs** — encriptación de contraseñas (nunca se guardan en texto plano)
- **jsonwebtoken (JWT)** — autenticación stateless
- **pg** — cliente de PostgreSQL para Node.js
- **dotenv** — manejo de variables de entorno

### Infraestructura
- **Docker** — contenedores para cada servicio
- **Docker Compose** — orquestación de los 3 contenedores (PostgreSQL + backend + frontend)
- **Volúmenes de Docker** — persistencia de datos de la base de datos

---

##  Arquitectura

```
┌─────────────────────────────────────────────────┐
│                  Docker Compose                  │
│                                                  │
│  ┌──────────────┐      ┌──────────────────────┐  │
│  │   Frontend   │      │       Backend        │  │
│  │  React + TS  │─────▶│  Node + Express + TS │  │
│  │  Nginx :5173 │      │      Port :3000       │  │
│  └──────────────┘      └──────────┬───────────┘  │
│                                   │              │
│                        ┌──────────▼───────────┐  │
│                        │      PostgreSQL 16    │  │
│                        │       Port :5432      │  │
│                        │   (volumen persistente)│  │
│                        └──────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Flujo de autenticación
```
Usuario → POST /api/auth/registro o /login
        → Backend valida credenciales
        → Regresa JWT token (válido 7 días)
        → Frontend guarda token en localStorage
        → Todas las peticiones siguientes incluyen: Authorization: Bearer <token>
        → Backend verifica token en cada ruta protegida
```

---

##  Correr el proyecto localmente

### Requisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop) instalado y corriendo

### Pasos

```bash
# 1. Clona el repositorio
git clone https://github.com/tu-usuario/gestor-tareas.git
cd gestor-tareas

# 2. Crea el archivo de variables de entorno
cp backend/.env.example backend/.env

# 3. Levanta todos los servicios
docker compose up --build
```

Abre `http://localhost:5173` en tu navegador. ¡Listo!

>  La primera vez tarda 2-3 minutos mientras se descargan y construyen las imágenes.

### Detener el proyecto
```bash
# Detener sin borrar datos
docker compose down

# Detener y borrar todos los datos (reset completo)
docker compose down -v
```

---

##  Estructura del proyecto

```
gestor-tareas/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.ts        # Conexión a PostgreSQL
│   │   │   └── schema.sql      # Definición de tablas
│   │   ├── middleware/
│   │   │   └── auth.ts         # Middleware de verificación JWT
│   │   ├── routes/
│   │   │   ├── auth.ts         # POST /registro, POST /login
│   │   │   ├── tableros.ts     # GET, POST, DELETE /tableros
│   │   │   └── tareas.ts       # GET, POST, PATCH, DELETE /tareas
│   │   └── index.ts            # Entry point del servidor
│   ├── .env.example
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.ts        # Instancia de axios con interceptor JWT
│   │   ├── context/
│   │   │   └── AuthContext.tsx # Estado global de autenticación
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Registro.tsx
│   │   │   ├── Tableros.tsx
│   │   │   └── Tareas.tsx
│   │   └── App.tsx             # Rutas y rutas protegidas
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

##  API Endpoints

### Autenticación (pública)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/registro` | Crear cuenta nueva |
| POST | `/api/auth/login` | Iniciar sesión |

### Tableros (requiere JWT)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/tableros` | Listar tableros del usuario |
| POST | `/api/tableros` | Crear tablero |
| DELETE | `/api/tableros/:id` | Eliminar tablero |

### Tareas (requiere JWT)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/tareas/tablero/:id` | Listar tareas de un tablero |
| POST | `/api/tareas` | Crear tarea |
| PATCH | `/api/tareas/:id/estado` | Cambiar estado |
| DELETE | `/api/tareas/:id` | Eliminar tarea |

---

##  Esquema de base de datos

```sql
usuarios
  id, nombre, email (único), password_hash, created_at

tableros
  id, nombre, usuario_id (FK → usuarios), created_at

tareas
  id, titulo, descripcion, estado (pendiente|en_progreso|completado),
  tablero_id (FK → tableros), created_at
```

---

##  Posibles mejoras futuras

- Drag & drop para mover tareas entre columnas
- Fechas límite y prioridades en tareas
- Invitar colaboradores a un tablero
- Deploy en la nube (Railway para backend + Vercel para frontend)
- Tests unitarios e integración

---

##  Autor

**Angel Viveros** — [GitHub](https://github.com/tu-usuario) · [LinkedIn](https://linkedin.com/in/tu-usuario)
