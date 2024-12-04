import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

export const subirFoto = async (file, nombreArchivo) => {
    const extension = '.jpeg';
    const nombreCompleto = `${nombreArchivo}${extension}`;
    const filePath = path.join(uploadDir, nombreCompleto);

    try {
        await fs.promises.rename(file.path, filePath);
        const imageUrl = `https://bettpplay-production.up.railway.app/uploads/${nombreCompleto}`;
        return imageUrl;
    } catch (error) {
        throw new Error('Error al guardar la imagen en el servidor');
    }
};

// En imagenservicio.js
export async function eliminarFoto(filename) {
    const filePath = path.join(uploadDir, filename);

    try {
        await promisify(fs.unlink)(filePath);
        console.log(`Archivo ${filename} eliminado con éxito.`);
    } catch (error) {
        console.error('Error al eliminar el archivo:', error);
        throw new Error('No se pudo eliminar el archivo');
    }
}

export async function modificarFoto(filename, nuevaFoto, nuevoNombre) {
    await eliminarFoto(filename);  // Llamada correcta a eliminarFoto
    const imageUrl = await subirFoto(nuevaFoto, nuevoNombre);
    return imageUrl;
}
