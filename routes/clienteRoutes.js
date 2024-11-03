import express from 'express';
import ClientesController from '../controllers/clienteController.js';
import authMiddleware from '../middlewares/authMiddleware.js'; // Para admin
import authClientMiddleware from '../middlewares/authClientMiddleware.js'; // Para clientes

const router = express.Router();

// Registrar un nuevo cliente
router.post('/registrar', ClientesController.registrar);

// Iniciar sesión
router.post('/login', ClientesController.login);

// Editar mis datos (cualquier cliente autenticado puede hacerlo)
router.put('/mis-datos', authClientMiddleware, ClientesController.editarMisDatos);

// Listar todos los clientes (solo para administradores)
router.get('/listar', authMiddleware(['administrador', 'superadministrador']), ClientesController.listarClientes);

// Cambiar estado de un cliente (solo para administradores)
router.put('/estado/:id', authMiddleware(['administrador', 'superadministrador']), ClientesController.cambiarEstadoCliente);

export default router;
