import express from 'express';
import { crearProducto, modificarProducto } from '../controllers/productoController.js'
import fileUpload from 'express-fileupload';

const router = express.Router();

// Ruta para crear un producto
router.post('/', fileUpload(), crearProducto);

// Ruta para modificar un producto
router.put('/:id', fileUpload(), modificarProducto);

export default router;
