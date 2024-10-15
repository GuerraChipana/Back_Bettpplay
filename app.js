import express from 'express';
import cors from 'cors';
import authMiddleware from './middlewares/authMiddleware.js'
import dotenv from 'dotenv';

// Importar rutas
import productoRoutes from './routes/productoRoutes.js';
import photosRoutes from './routes/photosRoutes.js';
import authRoutes from './routes/auhRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Cargar variables de entorno
dotenv.config();

const port = process.env.PORT || 3004; 
const app = express();

// Middleware de configuración
app.use(express.json()); // Para parsear JSON en las peticiones
app.use(cors({ origin: '*' }));

// Usar las rutas de autenticación (login no requiere token)
app.use('/api/auth', authRoutes); // Rutas de autenticación

// Aplica el middleware de autenticación solo a rutas que lo requieran
app.use(authMiddleware);

// Usar las rutas que requieren autenticación
app.use('/api/producto', productoRoutes);
app.use('/api/img', photosRoutes);
app.use('/api/users', userRoutes); // Rutas de usuarios

// Ruta por defecto en caso de errores 404
app.use((req, res, next) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error detectado:', err);
    res.status(500).json({ error: 'Error en el servidor' });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
