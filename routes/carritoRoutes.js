import express from 'express';
import authClientMiddleware from '../middlewares/authClientMiddleware.js';
import CarritoController from '../controllers/carritoController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas del carrito
router.post('/agregar', authClientMiddleware, CarritoController.agregarProducto);
router.get('/', authClientMiddleware, CarritoController.obtenerCarrito);
router.post('/orden', authClientMiddleware, CarritoController.crearOrden);
router.get('/ordenes', authClientMiddleware, CarritoController.obtenerOrdenes);
router.get('/admin/ordenes', authMiddleware(['administrador', 'superadministrador']), CarritoController.obtenerTodasLasOrdenes); // Para administrador
router.put('/actualizar', authClientMiddleware, CarritoController.actualizarCantidad);
router.delete('/eliminar/:id_producto', authClientMiddleware, CarritoController.eliminarProducto);

export default router;
