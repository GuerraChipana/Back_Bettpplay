import express from 'express';
import { obtenerTodasLasFotos, subirFoto, eliminarFoto, actualizarFoto } from '../controllers/photosController.js';

const router = express.Router();

router.get('/', obtenerTodasLasFotos);
router.post('/', subirFoto);
router.delete('/:filename', eliminarFoto);
router.put('/:filename', actualizarFoto);

export default router;
