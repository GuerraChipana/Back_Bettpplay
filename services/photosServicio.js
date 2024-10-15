import { verFotos, subirFoto, eliminarFoto, modificarFoto } from './s3Servicio.js';

export async function obtenerFotos() {
    try {
        return await verFotos();
    } catch (error) {
        throw new Error('Error al obtener las imágenes: ' + error.message);
    }
}

export async function subirNuevaFoto(file) {
    try {
        return await subirFoto(file);
    } catch (error) {
        throw new Error('Error al subir la imagen: ' + error.message);
    }
}

export async function eliminarUnaFoto(filename) {
    try {
        await eliminarFoto(filename);
    } catch (error) {
        throw new Error('Error al eliminar la foto: ' + error.message);
    }
}

export async function modificarUnaFoto(filename, nuevaFoto) {
    try {
        return await modificarFoto(filename, nuevaFoto);
    } catch (error) {
        throw new Error('Error al actualizar la foto: ' + error.message);
    }
}
