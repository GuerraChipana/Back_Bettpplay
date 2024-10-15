import { obtenerFotos, subirNuevaFoto, eliminarUnaFoto, modificarUnaFoto } from '../services/photosServicio.js';

export const obtenerTodasLasFotos = async (req, res) => {
    try {
        const fotos = await obtenerFotos();
        res.status(200).json(fotos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const subirFoto = async (req, res) => {
    try {
        const file = req.files?.imagen;
        if (!file) {
            return res.status(400).json({ error: 'No hay archivos para subir' });
        }
        const imageUrl = await subirNuevaFoto(file);
        res.status(201).json({ url: imageUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const eliminarFoto = async (req, res) => {
    try {
        const filename = req.params.filename;
        await eliminarUnaFoto(filename);
        res.status(200).json({ message: 'Foto eliminada con éxito' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const actualizarFoto = async (req, res) => {
    try {
        const filename = req.params.filename;
        const nuevaFoto = req.files?.imagen;
        if (!nuevaFoto) {
            return res.status(400).json({ error: 'No hay archivos para subir' });
        }
        const imageUrl = await modificarUnaFoto(filename, nuevaFoto);
        res.status(200).json({ url: imageUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
