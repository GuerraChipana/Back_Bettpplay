import { query } from "express";
import db from "../database/db.js";
import { subirFoto, eliminarFoto } from "../services/s3Servicio.js";

class CategoriaDAO {


    async AgregarCategoria(datosCategoria, file) {
        const { nombre_categoria, detalle_categoria, id_user_creacion } = datosCategoria;

        // Verificamos si existe una categoría igual
        const queryVerificar =
            `SELECT NOMBRE_CATEGORIA FROM CATEGORIAS WHERE NOMBRE_CATEGORIA = ?`;
        const [categoriaExistente] = await db.query(queryVerificar, [nombre_categoria]);
        if (categoriaExistente.length > 0) {
            throw new Error('Ya existe una categoría con el mismo nombre');
        }

        // Renombramos la imagen
        const nombreArchivo = `${nombre_categoria}`.replace(/\s+/g, '_').toLowerCase() + '.jpeg';
        file.name = nombreArchivo;

        // Subimos la imagen para obtener el URL
        const imageUrl = await subirFoto(file);
        datosCategoria.imageUrl = imageUrl; // Asegúrate de almacenar la URL

        // Insertamos en la tabla
        const queryInsertar = `INSERT INTO CATEGORIAS (IMAGEN_CATEGORIA, NOMBRE_CATEGORIA, DETALLE_CATEGORIA, ID_USER_CREACION) VALUES (?,?,?,?)`;
        const [result] = await db.query(queryInsertar, [
            imageUrl,
            nombre_categoria,
            detalle_categoria,
            id_user_creacion
        ]);
        return result.insertId;
    }

    async verificarCategoriaExistente(nombre_categoria, id) {
        const query = `SELECT NOMBRE_CATEGORIA FROM CATEGORIAS WHERE NOMBRE_CATEGORIA = ? AND ID != ?`;
        const [result] = await db.query(query, [nombre_categoria, id]);
        return result;
    }

    async editarCategoria(id, datosCategoria, file, id_user_modificacion) {
        const { nombre_categoria, detalle_categoria } = datosCategoria;

        const [categoriaActual] = await db.query('SELECT * FROM CATEGORIAS WHERE ID = ?', [id]);
        if (categoriaActual.length === 0) throw new Error('Categoría no encontrada');

        const imageUrlAnterior = categoriaActual[0].IMAGEN_CATEGORIA; // URL anterior
        const nombreArchivo = `${nombre_categoria}`.replace(/\s+/g, '_').toLowerCase() + '.jpeg';

        // Subimos la nueva imagen
        const nuevaImagenUrl = await subirFoto(file); // Usa tu función subirFoto

        const queryActualizar = `
        UPDATE CATEGORIAS
        SET imagen_categoria = ?, NOMBRE_CATEGORIA = ?, DETALLE_CATEGORIA = ?, FECHA_MODIFICACION = NOW(), ID_USER_MODIFICACION = ?
        WHERE ID = ?`;

        const result = await db.query(queryActualizar, [
            nuevaImagenUrl,
            nombre_categoria,
            detalle_categoria,
            id_user_modificacion,
            id
        ]);

        if (result.affectedRows === 0) {
            throw new Error('No se pudo actualizar la categoría');
        }

        return { id, nuevaImagenUrl, nombre_categoria, detalle_categoria };
    }

    async cambiarEstadoCategoria(id, nuevoEstado, id_user_modificacion) {
        const query = `
        UPDATE CATEGORIAS
        SET ESTADO_CATEGORIA = ?, ID_USER_MODIFICACION = ?, FECHA_MODIFICACION=NOW()
        WHERE ID = ?`;
        await db.query(query, [nuevoEstado, id_user_modificacion, id]);
        return { id, estado: nuevoEstado };
    }

    async listarCategorias({ estado = null, nombre = null }) {
        let query = 'SELECT IMAGEN_CATEGORIA, NOMBRE_CATEGORIA,DETALLE_CATEGORIA,ESTADO_CATEGORIA FROM categorias WHERE 1=1';
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
}

export default new CategoriaDAO();