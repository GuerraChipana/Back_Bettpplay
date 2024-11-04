import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import fileUploadMiddleware from '../middlewares/fileUpload.js';
import CategoriaController from '../controllers/categoriaControllers.js';

const router = express.Router();

// --------- Rutas para trabajadores ----------- //
router.post('/', authMiddleware(['administrador', 'empleado', 'superadministrador']), fileUploadMiddleware, CategoriaController.crearCategoria);
router.put('/:id', authMiddleware(['administrador', 'empleado', 'superadministrador']), fileUploadMiddleware, CategoriaController.modificarCategoria);
router.put('/:id/estado', authMiddleware(['administrador', 'empleado', 'superadministrador']), CategoriaController.cambiarEstado);
router.get('/', authMiddleware(['superadministrador', 'administrador', 'empleado']), CategoriaController.obtenerCategorias);
router.get('/nom/:nombre', authMiddleware(['superadministrador', 'administrador', 'empleado']), CategoriaController.obtenerCategoriasPorNombre);

// -------- Rutas para Clientes ----------- //
router.get('/client', CategoriaController.obtenerCategoriasActivas);
router.get('/client/:nombre', CategoriaController.obtenerCategoriasActivasPorNombre);

export default router;
