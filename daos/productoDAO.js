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

    // Actualizar el estado del producto según la cantidad
    async actualizarEstadoPorCantidad(productId) {
        const [producto] = await db.query('SELECT cantidad_producto FROM productos WHERE id = ?', [productId]);
        if (producto.length === 0) throw new Error('Producto no encontrado');

        const nuevaCantidad = producto[0].cantidad_producto;
        const nuevoEstado = nuevaCantidad > 0 ? 'activo' : 'agotado';

        const query =
            `UPDATE productos 
            SET estado_producto = ?
            WHERE id = ?;`;
        await db.query(query, [nuevoEstado, productId]);
        return { id: productId, estado: nuevoEstado };
    }

    // Listar todos los productos 
    async listarProductos({ estado = null, id_categoria = null, marca = null }) {
        let query = 'SELECT IMAGEN,NOMBRE_PRODUCTO,DESCRIPCION_PRODUCTO,MARCA_PRODUCTO, PRECIO_PRODUCTO,CANTIDAD_PRODUCTO,ESTADO_PRODUCTO,ID_CATEGORIA FROM productos WHERE 1=1';
        const params = [];

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

        const [productos] = await db.query(query, params);
        return productos;
    }
}

export default new ProductoDAO();
