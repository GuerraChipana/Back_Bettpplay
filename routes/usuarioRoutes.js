import express from 'express';
import {
    contratarUsuario,
    listarUsuarios,
    cambiarEstadoUsuario,
    editarUsuario
} from '../controllers/usuarioController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Solo accesible por administradores y superadministradores
router.post('/contratar', authMiddleware(['administrador', 'superadministrador']), contratarUsuario);
router.get('/', authMiddleware(['administrador', 'superadministrador']), listarUsuarios); 
router.put('/:id/estado', authMiddleware(['administrador', 'superadministrador']), cambiarEstadoUsuario); 
router.put('/:id/editar', authMiddleware(['administrador', 'superadministrador']), editarUsuario); 

export default router;
