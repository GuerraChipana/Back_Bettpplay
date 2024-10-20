import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import fileUploadMiddleware from '../middlewares/fileUpload.js';
import {
    crearCategoria, modificarCategoria, cambiarEstado,
    obtenerCategorias, obtenerCategoriasPorNombre,
    obtenerCategoriasActivas, obtenerCategoriasActivasPorNombre
} from '../controllers/categoriaControllers.js';

const router = express.Router();

// --------- Rutas para trabajadores ----------- //

router.post('/', authMiddleware(['administrador', 'empleado', 'superadministrador']), fileUploadMiddleware, crearCategoria);
router.put('/:id', authMiddleware(['administrador', 'empleado', 'superadministrador']), fileUploadMiddleware, modificarCategoria);
router.put('/:id/estado', authMiddleware(['administrador', 'empleado', 'superadministrador']), cambiarEstado);
router.get('/', authMiddleware(['superadministrador', 'administrador', 'empleado']), obtenerCategorias);
router.get('/nom/:nombre', authMiddleware(['superadministrador', 'administrador', 'empleado']), obtenerCategoriasPorNombre);

// -------- Rutas para Clientes ----------- //

router.get('/client', obtenerCategoriasActivas);
router.get('/client/:nombre', obtenerCategoriasActivasPorNombre);

export default router;