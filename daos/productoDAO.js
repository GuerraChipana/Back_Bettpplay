import db from '../database/db.js';
import { subirFoto, eliminarFoto } from '../services/imagenservicio.js';

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

        const imageUrl = await subirFoto(file, nombreArchivo);

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

        return { productoID: result.insertId, imageUrl };
    }

    async editarProducto(id, datosProducto, file, id_user_modificacion) {
        const { nombre_producto, descripcion_producto, marca_producto, precio_producto, id_categoria, cantidad_producto } = datosProducto;

        // Verificar si ya existe otro producto con el mismo nombre y marca, excluyendo el actual
        const queryVerificar = `
            SELECT * FROM productos 
            WHERE nombre_producto = ? AND marca_producto = ? AND id != ?`;
        const [productoExistente] = await db.query(queryVerificar, [nombre_producto, marca_producto, id]);

        if (productoExistente.length > 0) {
            throw new Error('Ya existe otro producto con el mismo nombre y marca');
        }

        // Realizamos la consulta para obtener los datos completos del producto
        const [productoActual] = await db.query('SELECT * FROM productos WHERE id = ?', [id]);
        console.log('Producto recuperado de la base de datos:', productoActual);

        if (productoActual.length === 0) {
            throw new Error('Producto no encontrado');
        }

        // Realizamos una consulta separada para obtener solo la imagen del producto
        const [imageUrlData] = await db.query('SELECT imagen FROM productos WHERE id = ?', [id]);

        console.log('Imagen anterior:', imageUrlData);  // Verifica si la URL está presente o no

        // Si la URL de la imagen es null o no está definida, la dejamos vacía
        let imageUrlAnterior = imageUrlData && imageUrlData[0] ? imageUrlData[0].imagen : null;

        console.log('Imagen URL anterior:', imageUrlAnterior);  // Verifica si la URL de la imagen fue recuperada correctamente

        // Si no se pasa un archivo (imagen), conservamos la URL anterior
        let nuevaImagenUrl = imageUrlAnterior;

        // Si se ha recibido un archivo (imagen), procesamos la nueva imagen
        if (file) {
            console.log('Nuevo archivo recibido:', file);

            const nuevoNombreArchivo = `${marca_producto}_${nombre_producto}`.replace(/\s+/g, '_').toLowerCase() + '.jpeg';

            // Si existe una imagen anterior, la eliminamos
            if (imageUrlAnterior) {
                const nombreArchivoAnterior = imageUrlAnterior.split('/').pop();
                await eliminarFoto(nombreArchivoAnterior);  // Elimina la imagen anterior si existe
            }

            // Subimos la nueva imagen y obtenemos su URL
            nuevaImagenUrl = await subirFoto(file, nuevoNombreArchivo);
            console.log('Nueva imagen subida, URL:', nuevaImagenUrl);
        }

        // Si la cantidad no está definida, usamos la cantidad actual del producto
        const nuevaCantidad = cantidad_producto !== undefined ? cantidad_producto : productoActual[0].cantidad_producto;

        // Actualizamos los datos del producto en la base de datos
        const queryActualizar = `
            UPDATE productos 
            SET imagen = ?, nombre_producto = ?, descripcion_producto = ?, marca_producto = ?,
            precio_producto = ?, cantidad_producto = ?, id_categoria = ?, fecha_modificacion = NOW(), id_user_modificacion = ?
            WHERE id = ?`;

        const result = await db.query(queryActualizar, [
            nuevaImagenUrl,  // La URL de la imagen (anterior o nueva)
            nombre_producto,
            descripcion_producto,
            marca_producto,
            precio_producto,
            nuevaCantidad,
            id_categoria,
            id_user_modificacion,
            id
        ]);

        // Si no se actualizó ninguna fila, lanzamos un error
        if (result.affectedRows === 0) {
            throw new Error('No se pudo actualizar el producto');
        }

        // Retornamos el producto con los datos actualizados, incluyendo la URL de la imagen
        return {
            id,
            nombre_producto,
            descripcion_producto,
            marca_producto,
            precio_producto,
            id_categoria,
            imagen: nuevaImagenUrl,  // Siempre incluimos la URL de la imagen
            cantidad_producto: nuevaCantidad
        };
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
    // Método para buscar un producto por ID
    async buscarProductoPorId(id) {
        const [producto] = await db.query('SELECT * FROM productos WHERE id = ?', [id]);
        if (producto.length === 0) throw new Error('Producto no encontrado');
        return producto[0]; // Retornar el primer producto encontrado
    }


}

export default new ProductoDAO();
