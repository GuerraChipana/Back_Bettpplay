import db from '../database/db.js';
import { subirFoto, eliminarFoto } from '../services/s3Servicio.js';

class ProductoDAO {
    // Agregar un nuevo producto
    async agregarProducto(datosProducto, file) {
        const { nombre_producto, descripcion_producto, marca_producto, precio_producto, id_categoria, id_user_creacion } = datosProducto;

        // Verificar si ya existe un producto con el mismo nombre y marca
        const queryVerificar =
            `SELECT * FROM productos 
            WHERE nombre_producto = ? AND marca_producto = ?`;
        const [productoExistente] = await db.query(queryVerificar, [nombre_producto, marca_producto]);

        if (productoExistente.length > 0) {
            throw new Error('Ya existe un producto con el mismo nombre y marca');
        }

        // Procesar la imagen
        const nombreArchivo = `${marca_producto}_${nombre_producto}`.replace(/\s+/g, '_').toLowerCase() + '.jpeg';
        file.name = nombreArchivo;

        const imageUrl = await subirFoto(file);

        // Insertar el nuevo producto con cantidad inicial 0 y estado "agotado"
        const queryInsertar =
            `INSERT INTO productos
            (imagen, nombre_producto, descripcion_producto, marca_producto, precio_producto, cantidad_producto, estado_producto, id_categoria, id_user_creacion)
            VALUES(?, ?, ?, ?, ?, 0, 'agotado', ?, ?);`;
        const [result] = await db.query(queryInsertar, [
            imageUrl,
            nombre_producto,
            descripcion_producto,
            marca_producto,
            precio_producto,
            id_categoria,
            id_user_creacion
        ]);

        return result.insertId;
    }

    async editarProducto(id, datosProducto, file, id_user_modificacion) {
        const { nombre_producto, descripcion_producto, marca_producto, precio_producto, id_categoria, cantidad_producto } = datosProducto;

        // Verificar si ya existe otro producto con el mismo nombre y marca, excluyendo el actual
        const queryVerificar =
            `SELECT * FROM productos 
            WHERE nombre_producto = ? AND marca_producto = ? AND id != ?`;
        const [productoExistente] = await db.query(queryVerificar, [nombre_producto, marca_producto, id]);

        if (productoExistente.length > 0) {
            throw new Error('Ya existe otro producto con el mismo nombre y marca');
        }

        const [productoActual] = await db.query('SELECT * FROM productos WHERE id = ?', [id]);
        if (productoActual.length === 0) throw new Error('Producto no encontrado');

        let imageUrl = productoActual[0].imagen;
        const nombreArchivoNuevo = `${marca_producto}_${nombre_producto}`.replace(/\s+/g, '_').toLowerCase() + '.jpeg';

        if (file) {
            await eliminarFoto(imageUrl);
            file.name = nombreArchivoNuevo;
            imageUrl = await subirFoto(file);
        }

        const nuevaCantidad = cantidad_producto !== undefined ? cantidad_producto : productoActual[0].cantidad_producto;

        const queryActualizar =
            `UPDATE productos 
            SET imagen = ?, nombre_producto = ?, descripcion_producto = ?, marca_producto = ?,
            precio_producto = ?, cantidad_producto = ?, id_categoria = ?,
            fecha_modificacion = NOW(), id_user_modificacion = ?
            WHERE id = ?`;

        await db.query(queryActualizar, [
            imageUrl,
            nombre_producto,
            descripcion_producto,
            marca_producto,
            precio_producto,
            nuevaCantidad,
            id_categoria,
            id_user_modificacion,
            id
        ]);

        return { id, nombre_producto, descripcion_producto, marca_producto, precio_producto, id_categoria, imageUrl, nuevaCantidad };
    }

    // Cambiar el estado del producto a un estado específico
    async cambiarEstadoProducto(id, nuevoEstado, id_user_modificacion) {
        const query =
            `UPDATE productos 
            SET estado_producto = ?, id_user_modificacion = ?, fecha_modificacion = NOW() 
            WHERE id = ?;`;
        await db.query(query, [nuevoEstado, id_user_modificacion, id]);
        return { id, estado: nuevoEstado };
    }

    async listarProductosConEstado({ estado = null, id_categoria = null, marca = null, listarTodos = false }) {
        // Consultar todos los productos o con filtros
        let query = `
            SELECT 
                id,
                imagen,
                nombre_producto,
                descripcion_producto,
                marca_producto,
                precio_producto,
                cantidad_producto,
                estado_producto,
                id_categoria 
            FROM productos WHERE 1=1`;

        const params = [];

        if (!listarTodos) {
            if (estado) {
                query += ' AND estado_producto = ?';
                params.push(estado);
            }
            if (id_categoria) {
                query += ' AND id_categoria = ?';
                params.push(id_categoria);
            }
            if (marca) {
                query += ' AND marca_producto = ?';
                params.push(marca);
            }
        }

        const [productos] = await db.query(query, params);

        // Actualizar el estado de cada producto basado en la cantidad
        for (const producto of productos) {
            const nuevoEstado = producto.cantidad_producto > 0 ? 'activo' : 'agotado';

            // No cambiar el estado si el producto está desmantelado
            if (producto.estado_producto !== 'descontinuado' && producto.estado_producto !== nuevoEstado) {
                // Actualizar el estado en la base de datos si ha cambiado
                const queryActualizar = `
                    UPDATE productos 
                    SET estado_producto = ?
                    WHERE id = ?;`;
                await db.query(queryActualizar, [nuevoEstado, producto.id]);
                producto.estado_producto = nuevoEstado; // Actualiza el objeto local
            }
        }

        return productos;
    }
    // Método para buscar un producto por ID
    async buscarProductoPorId(id) {
        const [producto] = await db.query('SELECT * FROM productos WHERE id = ?', [id]);
        if (producto.length === 0) throw new Error('Producto no encontrado');
        return producto[0]; // Retornar el primer producto encontrado
    }

    // Método para actualizar un producto
    async actualizarProducto(producto) {
        const queryActualizar = `
            UPDATE productos 
            SET 
                imagen = ?,
                nombre_producto = ?,
                descripcion_producto = ?,
                marca_producto = ?,
                precio_producto = ?,
                cantidad_producto = ?,
                estado_producto = ?,
                id_categoria = ?,
                fecha_modificacion = NOW() 
            WHERE id = ?`;

        await db.query(queryActualizar, [
            producto.imagen,
            producto.nombre_producto,
            producto.descripcion_producto,
            producto.marca_producto,
            producto.precio_producto,
            producto.cantidad_producto,
            producto.estado_producto,
            producto.id_categoria,
            producto.id
        ]);

        return producto; // Retornar el producto actualizado
    }
    // productoDAO.js
    async reducirCantidadProducto(id_producto, cantidad) {
        const query = `UPDATE productos SET cantidad_producto = cantidad_producto - ? WHERE id = ?`;
        await db.query(query, [cantidad, id_producto]);
    }


}

export default new ProductoDAO();
