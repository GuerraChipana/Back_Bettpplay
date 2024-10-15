import express from 'express';
import { 
    obtenerUsuarioController, 
    registrarAdminController, 
    cambiarEstadoUsuarioController, 
    eliminarUsuarioController,
    editarUsuarioController,
    cambiarRolUsuarioController,
    listarUsuariosController 
} from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas protegidas por el middleware de autenticación
router.get('/me', authMiddleware, obtenerUsuarioController);
router.get('/', authMiddleware, listarUsuariosController);
router.post('/', authMiddleware, registrarAdminController);
router.put('/:id/estado', authMiddleware, cambiarEstadoUsuarioController);
router.delete('/:id', authMiddleware, eliminarUsuarioController);
router.put('/me', authMiddleware, editarUsuarioController);
router.put('/:id/rol', authMiddleware, cambiarRolUsuarioController);

export default router;
