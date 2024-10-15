import { subirFoto, modificarFoto, eliminarFoto } from './s3Servicio.js';
import db from '../database/db.js';
 
export async function agregarProducto(datosProducto, file) {
    const {
        nombre_producto,
        descripcion_producto,
        marca_producto,
        precio_producto,
        categoria_id,
        id_user_creacion
    } = datosProducto;

    const cantidad_producto = datosProducto.cantidad_producto || 0;

    if (!nombre_producto || !descripcion_producto || !marca_producto || !precio_producto || !categoria_id || !id_user_creacion || !file) {
        throw new Error('Todos los campos son requeridos, incluyendo la imagen');
    }

    try {
        // Verificamos si existe un nombre y marca igual
        const [productoExistente] = await db.query(
            'SELECT * FROM productos WHERE nombre_producto = ? AND marca_producto = ?',
            [nombre_producto, marca_producto]
        );

        if (productoExistente.length > 0) {
            throw new Error('Ya existe un producto con el mismo nombre y marca');
        }

        // Creamos el nombre de la imagen que subiremos 
        const nombreArchivo = `${marca_producto}_${nombre_producto}`.replace(/\s+/g, '_').toLowerCase() + '.jpeg';
        file.name = nombreArchivo;

        // Subimos la imagen a S3
        const imageUrl = await subirFoto(file);

        // Consulta SQL para insertar el nuevo producto
        const query = `
            INSERT INTO productos 
            (imagen, nombre_producto, descripcion_producto, marca_producto, precio_producto, cantidad_producto, categoria_id, id_user_creacion, fecha_registro) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW());
        `;

        const [result] = await db.query(query, [
            imageUrl,
            nombre_producto,
            descripcion_producto,
            marca_producto,
            precio_producto,
            cantidad_producto,
            categoria_id,
            id_user_creacion
        ]);

        console.log('Producto agregado:', {
            productoId: result.insertId,
            imageUrl,
            nombre_producto,
            descripcion_producto,
            marca_producto,
            precio_producto,
            cantidad_producto,
            categoria_id,
            id_user_creacion
        });

        return imageUrl;
    } catch (error) {
        throw new Error('Error al agregar el producto: ' + error.message);
    }
}

export async function editarProducto(id, datosProducto, file, id_user_modificacion) {
    const { nombre_producto, descripcion_producto, marca_producto, precio_producto, categoria_id, cantidad_producto } = datosProducto;

    try {
        // Consulta si existe el id del producto
        const [productoExistente] = await db.query('SELECT * FROM productos WHERE id = ?', [id]);

        if (productoExistente.length === 0) {
            throw new Error('Producto no encontrado');
        }

        // Verificamos si existe un nombre y marca igual
        const [productoDuplicado] = await db.query(
            'SELECT * FROM productos WHERE nombre_producto = ? AND marca_producto = ? AND id != ?',
            [nombre_producto, marca_producto, id]
        );

        if (productoDuplicado.length > 0) {
            throw new Error('Ya existe un producto con el mismo nombre y marca');
        }

        let imageUrl = productoExistente[0].imagen; // Imagen existente
        const nombreArchivoNuevo = `${marca_producto}_${nombre_producto}`.replace(/\s+/g, '_').toLowerCase() + '.jpeg';

        // Si el nombre del producto ha cambiado, eliminamos la imagen existente y subimos una nueva
        if (nombre_producto !== productoExistente[0].nombre_producto) {
            // Eliminar la imagen existente
            console.log(`Eliminando imagen: ${imageUrl}`);
            await eliminarFoto(imageUrl);
            console.log(`Imagen eliminada: ${imageUrl}`);

            // Subir la nueva imagen si hay un archivo
            if (file) {
                file.name = nombreArchivoNuevo;
                console.log(`Subiendo nueva imagen: ${file.name}`);
                imageUrl = await subirFoto(file); // Cambia la imagen en S3
                console.log(`Nueva imagen subida: ${imageUrl}`);
            } else {
                throw new Error('Debes subir una nueva imagen al cambiar el nombre del producto');
            }
        } else if (file) {
            // Si hay un nuevo archivo y el nombre no ha cambiado, solo subimos la nueva imagen
            file.name = nombreArchivoNuevo;
            console.log(`Subiendo nueva imagen: ${file.name}`);
            imageUrl = await modificarFoto(productoExistente[0].imagen, file); // Cambia la imagen en S3
        }

        const nuevaCantidad = cantidad_producto !== undefined ? cantidad_producto : productoExistente[0].cantidad_producto;

        // Consulta SQL para actualizar el producto
        const query = `
            UPDATE productos 
            SET imagen = ?, nombre_producto = ?, descripcion_producto = ?, marca_producto = ?, 
                precio_producto = ?, cantidad_producto = ?, categoria_id = ?, 
                id_user_modificacion = ?, fecha_modificacion = NOW()
            WHERE id = ?;
        `;

        await db.query(query, [
            imageUrl,
            nombre_producto,
            descripcion_producto,
            marca_producto,
            precio_producto,
            nuevaCantidad,
            categoria_id,
            id_user_modificacion,
            id
        ]);

        const productoActualizado = {
            id,
            nombre_producto,
            descripcion_producto,
            marca_producto,
            precio_producto,
            imageUrl,
            nuevaCantidad
        };

        console.log('Producto actualizado:', productoActualizado);

        return productoActualizado;
    } catch (error) {
        throw new Error('Error al actualizar el producto: ' + error.message);
    }
}

export async function listarProductos() {
    try {
        const query = `SELECT id, imagen, nombre_producto, descripcion_producto,
         marca_producto, precio_producto, cantidad_producto, categoria_id FROM productos`;
        const [productos] = await db.query(query);

        console.log('Productos listados:', productos);
        return productos;
    } catch (error) {
        throw new Error('Error al listar productos: ' + error.message);
    }
}


export async function cambiarEstadoProducto(id, estado, id_user_modificacion) {
    try {
        const query = `
            UPDATE productos 
            SET estado = ?, id_user_modificacion = ?, fecha_modificacion = NOW() 
            WHERE id = ?;
        `;

        await db.query(query, [estado, id_user_modificacion, id]);

        console.log(`Estado del producto con ID ${id} actualizado a: ${estado}`);
        
        return { id, estado };
    } catch (error) {
        throw new Error('Error al cambiar el estado del producto: ' + error.message);
    }
}
