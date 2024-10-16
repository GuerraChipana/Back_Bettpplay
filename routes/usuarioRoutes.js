import express from 'express';
import {
    contratarUsuario, listarUsuarios, cambiarEstadoUsuario,
    cambiarRolUsuario, editarMisDatos
} from '../controllers/usuarioController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Solo accesible por administradores y superadministradores
router.post('/contratar', authMiddleware(['administrador', 'superadministrador']), contratarUsuario);
router.get('/', authMiddleware(['administrador', 'superadministrador']), listarUsuarios);
router.put('/:id/estado', authMiddleware(['administrador', 'superadministrador']), cambiarEstadoUsuario);
router.put('/:id/rol', authMiddleware(['superadministrador']), cambiarRolUsuario); // Para cambiar el rol
router.put('/mis-datos', authMiddleware(['administrador', 'superadministrador', 'empleado']), editarMisDatos); // Para editar datos personales

export default router;
