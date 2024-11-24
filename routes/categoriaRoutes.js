import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import fileUploadMiddleware from '../middlewares/fileUpload.js'; // Middleware para manejar la carga de archivos
import CategoriaController from '../controllers/categoriaControllers.js';

const router = express.Router();

// -------- Rutas para Clientes ----------- //
router.get('/client', CategoriaController.obtenerCategoriasActivas);
router.get('/client/:nombre', CategoriaController.obtenerCategoriasActivasPorNombre);
router.get('/client/:id', CategoriaController.obtenerCategoriaActivaPorId);

// --------- Rutas para trabajadores ----------- //
router.post('/',
    authMiddleware(['administrador', 'empleado', 'superadministrador']),  // Middleware para autenticación
    fileUploadMiddleware,  // Middleware para cargar archivos
    CategoriaController.crearCategoria  // Llamada al controlador para crear la categoría
);


router.put('/:id', authMiddleware(['administrador', 'empleado', 'superadministrador']), fileUploadMiddleware, CategoriaController.modificarCategoria);
router.put('/:id/estado', authMiddleware(['administrador', 'empleado', 'superadministrador']), CategoriaController.cambiarEstado);
router.get('/', authMiddleware(['superadministrador', 'administrador', 'empleado']), CategoriaController.obtenerCategorias);
router.get('/nom/:nombre', authMiddleware(['superadministrador', 'administrador', 'empleado']), CategoriaController.obtenerCategoriasPorNombre);
router.get('/:id', authMiddleware(['superadministrador', 'administrador', 'empleado']), CategoriaController.obtenerCategoriaPorId);

export default router;
