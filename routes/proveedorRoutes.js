import express from 'express';
import ProveedorController from '../controllers/proveedorController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/agregar', authMiddleware(['superadministrador', 'administrador']), ProveedorController.agregarProveedor);
router.put('/edit/:id', authMiddleware(['superadministrador', 'administrador']), ProveedorController.editarProveedor);
router.put('/estado/:id', authMiddleware(['superadministrador', 'administrador']), ProveedorController.cambiarEstadoProveedor);
router.get('/listar', authMiddleware(['superadministrador', 'administrador']), ProveedorController.listarProveedores);

export default router;
