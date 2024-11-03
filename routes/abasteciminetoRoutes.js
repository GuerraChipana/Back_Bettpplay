import express from 'express';
import abastecimientoController from '../controllers/abastecimientoController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/listar', authMiddleware(['superadministrador', 'administrador']), abastecimientoController.listarAbastecimientos);
router.post('/abastecer', authMiddleware(['superadministrador', 'administrador']), abastecimientoController.registrarAbastecimiento);
router.get('/categorias/activas', authMiddleware(['superadministrador', 'administrador']), abastecimientoController.obtenerCategoriasActivas);
router.get('/proveedores/categoria/:idCategoria', authMiddleware(['superadministrador', 'administrador']), abastecimientoController.obtenerProveedoresPorCategoria);
router.get('/productos/categoria/:idCategoria', authMiddleware(['superadministrador', 'administrador']), abastecimientoController.obtenerProductosPorCategoria);

export default router;
