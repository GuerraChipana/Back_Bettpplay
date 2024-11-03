import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importar rutas
import productoRoutes from './routes/productoRoutes.js';
import photosRoutes from './routes/photosRoutes.js';
import authRoutes from './routes/auhRoutes.js';
import userRoutes from './routes/usuarioRoutes.js';
import categoriaRoutes from './routes/categoriaRoutes.js';
import proveedorRoutes from './routes/proveedorRoutes.js';
import abastecimientoRoutes from './routes/abasteciminetoRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';

// Cargar variables de entorno
dotenv.config();

const port = process.env.PORT;
const app = express();

// Middleware de configuración
app.use(express.json());
app.use(cors({ origin: '*' }));

// Usar las rutas de autenticación (login no requiere token)
app.use('/api/auth', authRoutes);
app.use('/api/producto', productoRoutes);
app.use('/api/img', photosRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categoria', categoriaRoutes);
app.use('/api/proveedor', proveedorRoutes);
app.use('/api/abas', abastecimientoRoutes);
app.use('/api/cliente',clienteRoutes);
// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error detectado:', err);
    res.status(500).json({ error: err.message || 'Error en el servidor' });
});
// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
