import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import fileUploadMiddleware from '../middlewares/fileUpload.js';
import {
    crearProducto, modificarProducto, obtenerProductos, obtenerProductosPorCategoria,
    obtenerProductosPorMarca, cambiarEstado, obtenerProductosActivos,
    obtenerProductosActivosPorCategoria, obtenerProductosActivosPorMarca
} from '../controllers/productoController.js';

const router = express.Router();

// -------------------- Rutas para Trabajadores --------------------
// Rutas que requieren autenticación y verificación de roles
router.post('/', authMiddleware(['administrador', 'empleado', 'superadministrador']), fileUploadMiddleware, crearProducto);
router.put('/:id', authMiddleware(['administrador', 'empleado', 'superadministrador']), fileUploadMiddleware, modificarProducto);
router.get('/', authMiddleware(['administrador', 'empleado', 'superadministrador']), obtenerProductos);
router.get('/categoria/:categoriaId', authMiddleware(['administrador', 'empleado', 'superadministrador']), obtenerProductosPorCategoria);
router.get('/marca/:marca', authMiddleware(['administrador', 'empleado', 'superadministrador']), obtenerProductosPorMarca);
router.put('/:id/estado', authMiddleware(['administrador', 'empleado', 'superadministrador']), cambiarEstado);

// -------------------- Rutas para Clientes --------------------
// Listar productos activos (Acceso público, no requiere autenticación)
router.get('/activos', obtenerProductosActivos);
router.get('/activos/categoria/:categoriaId', obtenerProductosActivosPorCategoria);
router.get('/activos/marca/:marca', obtenerProductosActivosPorMarca);

export default router;