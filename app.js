import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io'; 

// Importar rutas
import productoRoutes from './routes/productoRoutes.js';
import authRoutes from './routes/auhRoutes.js';
import userRoutes from './routes/usuarioRoutes.js';
import categoriaRoutes from './routes/categoriaRoutes.js';
import proveedorRoutes from './routes/proveedorRoutes.js';
import abastecimientoRoutes from './routes/abasteciminetoRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import carritoRoutes from './routes/carritoRoutes.js';

// Cargar variables de entorno
dotenv.config();

const port = process.env.PORT;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware de configuración
app.use(express.json());
app.use(cors()); 

// Usar las rutas de autenticación (login no requiere token)
app.use('/api/auth', authRoutes);
app.use('/api/producto', productoRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categoria', categoriaRoutes);
app.use('/api/proveedor', proveedorRoutes);
app.use('/api/abas', abastecimientoRoutes);
app.use('/api/cliente',clienteRoutes);
app.use('/api/carrito', carritoRoutes);

import path from 'path';
import url from 'url';

// Obtener la ruta del directorio actual
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// Ahora puedes usar __dirname para construir la ruta
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error detectado:', err);
    res.status(500).json({ error: err.message || 'Error en el servidor' });
});

// Escuchar conexiones de WebSocket
io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado');

    socket.on('disconnect', () => {
        console.log('Un usuario se ha desconectado');
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
