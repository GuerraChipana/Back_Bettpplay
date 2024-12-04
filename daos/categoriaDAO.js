import db from "../database/db.js";
import { subirFoto } from "../services/imagenservicio.js"; // Asegúrate de tener esta función bien implementada
import { eliminarFoto } from '../services/imagenservicio.js';  // Ajusta la ruta según tu estructura de directorios

class CategoriaDAO {

    async AgregarCategoria(datosCategoria, file) {
        const { nombre_categoria, detalle_categoria, id_user_creacion } = datosCategoria;

        // Verificamos si existe una categoría con el mismo nombre
        const queryVerificar = `SELECT nombre_categoria FROM categorias WHERE nombre_categoria = ?`;
        const [categoriaExistente] = await db.query(queryVerificar, [nombre_categoria]);
        if (categoriaExistente.length > 0) {
            throw new Error('Ya existe una categoría con el mismo nombre');
        }

        // Renombramos la imagen con el nombre de la categoría
        const nombreArchivo = `${nombre_categoria.replace(/\s+/g, '_').toLowerCase()}`;

        try {
            // Subimos la imagen y obtenemos la URL pública de la imagen
            const imageUrl = await subirFoto(file, nombreArchivo);

            // Insertamos la categoría en la base de datos
            const queryInsertar = `INSERT INTO categorias (imagen_categoria, nombre_categoria, detalle_categoria, id_user_creacion) VALUES (?,?,?,?)`;
            const [result] = await db.query(queryInsertar, [
                imageUrl,
                nombre_categoria,
                detalle_categoria,
                id_user_creacion
            ]);

            return { categoriaId: result.insertId, imageUrl }; // Devolvemos el ID y la URL de la imagen
        } catch (err) {
            console.error('Error al subir la imagen:', err);
            throw new Error('Hubo un problema al subir la imagen');
        }
    }

    async verificarCategoriaExistente(nombre_categoria, id) {
        const query = `SELECT nombre_categoria FROM categorias WHERE nombre_categoria = ? AND id != ?`;
        const [result] = await db.query(query, [nombre_categoria, id]);
        return result;
    }
    async editarCategoria(id, datosCategoria, file, id_user_modificacion) {
        const { nombre_categoria, detalle_categoria } = datosCategoria;

        // Realizamos la consulta para obtener los datos completos de la categoría
        const [categoriaActual] = await db.query('SELECT * FROM categorias WHERE id = ?', [id]);

        console.log('Datos recuperados de la base de datos:', categoriaActual);  // Verifica qué datos estás recibiendo

        // Si no se encuentra la categoría, lanzamos un error
        if (!categoriaActual || categoriaActual.length === 0) {
            console.log('Categoría no encontrada para ID:', id);
            throw new Error('Categoría no encontrada');
        }

        // Comprobamos si el nombre de la categoría ya existe en otra categoría (diferente a la actual)
        const [existingCategory] = await db.query('SELECT * FROM categorias WHERE nombre_categoria = ? AND id != ?', [nombre_categoria, id]);

        if (existingCategory.length > 0) {
            throw new Error('Ya existe otra categoría con el mismo nombre');
        }

        // Realizamos una consulta separada para obtener solo la imagen de la categoría
        const [imageUrlData] = await db.query('SELECT imagen_categoria FROM categorias WHERE id = ?', [id]);

        console.log('Imagen anterior:', imageUrlData);  // Verifica si la URL está presente o no

        // Si la URL de la imagen es null o no está definida, la dejamos vacía
        let imageUrlAnterior = imageUrlData && imageUrlData[0] ? imageUrlData[0].imagen_categoria : null;

        console.log('Imagen URL anterior:', imageUrlAnterior);  // Verifica si la URL de la imagen fue recuperada correctamente

        // Si no se pasa un archivo (imagen), conservamos la URL anterior
        let nuevaImagenUrl = imageUrlAnterior;

        // Si se ha recibido un archivo (imagen), procesamos la nueva imagen
        if (file) {
            console.log('Nuevo archivo recibido:', file);

            const nuevoNombreArchivo = nombre_categoria.replace(/\s+/g, '_').toLowerCase();

            // Si existe una imagen anterior, la eliminamos
            if (imageUrlAnterior) {
                const nombreArchivoAnterior = imageUrlAnterior.split('/').pop();
                await eliminarFoto(nombreArchivoAnterior);  // Elimina la imagen anterior si existe
            }

            // Subimos la nueva imagen y obtenemos su URL
            nuevaImagenUrl = await subirFoto(file, nuevoNombreArchivo);
            console.log('Nueva imagen subida, URL:', nuevaImagenUrl);
        }

        // Actualizamos los datos de la categoría en la base de datos
        const queryActualizar = `
            UPDATE categorias
            SET imagen_categoria = ?, nombre_categoria = ?, detalle_categoria = ?, fecha_modificacion = NOW(), id_user_modificacion = ?
            WHERE id = ?`;

        const result = await db.query(queryActualizar, [
            nuevaImagenUrl,  // Si no se pasa imagen, se conserva la URL anterior
            nombre_categoria,
            detalle_categoria,
            id_user_modificacion,
            id
        ]);

        // Si no se actualizó ninguna fila, lanzamos un error
        if (result.affectedRows === 0) {
            throw new Error('No se pudo actualizar la categoría');
        }

        // Retornamos la categoría con los datos actualizados, incluyendo la URL de la imagen
        return {
            id,
            imagen_categoria: nuevaImagenUrl,  // Siempre incluimos la URL de la imagen
            nombre_categoria,
            detalle_categoria,
            estado_categoria: categoriaActual[0].estado_categoria  // Incluimos el estado también si lo deseas
        };
    }

    async cambiarEstadoCategoria(id, nuevoEstado, id_user_modificacion) {
        const query = `
        UPDATE categorias
        SET estado_categoria = ?, id_user_modificacion = ?, fecha_modificacion = NOW()
        WHERE id = ?`;
        await db.query(query, [nuevoEstado, id_user_modificacion, id]);
        return { id, estado: nuevoEstado };
    }

    async listarCategorias({ estado = null, nombre = null }) {
        let query = 'SELECT id, imagen_categoria, nombre_categoria, detalle_categoria, estado_categoria FROM categorias WHERE 1=1';
        const params = [];

        if (estado) {
            query += ' AND estado_categoria = ?';
            params.push(estado);
        }
        if (nombre) {
            query += ' AND nombre_categoria LIKE ?';
            params.push(`%${nombre}%`); // Uso de LIKE para buscar coincidencias parciales
        }

        const [categorias] = await db.query(query, params);
        return categorias;
    }
    // Obtener categoría por ID
    async obtenerCategoriaPorId(id) {
        const query = `SELECT id, imagen_categoria, nombre_categoria, detalle_categoria, estado_categoria FROM categorias WHERE id = ?`;
        const [categoria] = await db.query(query, [id]);
        return categoria.length > 0 ? categoria[0] : null;
    }
    // Obtener categoría activa por ID
    async obtenerCategoriaActivaPorId(id) {
        const query = `SELECT imagen_categoria, nombre_categoria, detalle_categoria, estado_categoria FROM categorias WHERE id = ? AND estado_categoria = 'activo'`;
        const [categoria] = await db.query(query, [id]);
        return categoria.length > 0 ? categoria[0] : null;
    }

}

export default new CategoriaDAO();
