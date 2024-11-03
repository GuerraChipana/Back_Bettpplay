import db from '../database/db.js';

class abastecimientoDAO {
    async listarAbastecimientos() {
        const query = `
            SELECT 
                a.id_abastecimiento, 
                a.cantidad, 
                a.precio_unitario, 
                a.total, 
                p.nombre_proveedor, 
                prod.nombre_producto, 
                prod.marca_producto,
                c.nombre_categoria
            FROM abastecimientos a
            INNER JOIN proveedores p ON a.id_proveedor = p.id
            INNER JOIN productos prod ON a.id_producto = prod.id
            INNER JOIN categorias c ON a.id_categoria = c.id
        `;
        const [abastecimientos] = await db.query(query);
        return abastecimientos;
    }

    async validarProveedorActivo(idProveedor) {
        const query = `
            SELECT COUNT(*) as count
            FROM proveedores
            WHERE id = ? AND estado_proveedor = 'activo'
        `;
        const [result] = await db.query(query, [idProveedor]);
        return result[0].count > 0;
    }

    async validarMarcaPorCategoria(marcaProducto, idCategoria) {
        const query = `
            SELECT COUNT(*) as count
            FROM productos
            WHERE marca_producto = ? AND id_categoria = ?
        `;
        const [result] = await db.query(query, [marcaProducto, idCategoria]);
        return result[0].count > 0;
    }

    async obtenerProductosPorMarcaYCategoria(marcaProducto, idCategoria) {
        const query = `
            SELECT id, nombre_producto, cantidad_producto
            FROM productos
            WHERE marca_producto = ? AND id_categoria = ?
        `;
        const [productos] = await db.query(query, [marcaProducto, idCategoria]);
        return productos;
    }
    async obtenerDetallesProducto(idProducto) {
        const query = `SELECT nombre_producto, cantidad_producto FROM productos WHERE id = ?`;
        const [producto] = await db.query(query, [idProducto]);
        return producto[0]; // Devuelve el primer producto encontrado
    }
    
    async obtenerDetallesCategoria(idCategoria) {
        const query = `SELECT nombre_categoria FROM categorias WHERE id = ?`;
        const [categoria] = await db.query(query, [idCategoria]);
        return categoria[0]; // Devuelve la categoría encontrada
    }
    
    async obtenerDetallesProveedor(idProveedor) {
        const query = `SELECT nombre_proveedor FROM proveedores WHERE id = ?`;
        const [proveedor] = await db.query(query, [idProveedor]);
        return proveedor[0]; // Devuelve el proveedor encontrado
    }
    async actualizarCantidadProducto(idProducto, nuevaCantidad) {
        const query = `
            UPDATE productos 
            SET cantidad_producto = ? 
            WHERE id = ?
        `;
        await db.query(query, [nuevaCantidad, idProducto]);
    }
    

    async registrarAbastecimiento(datosAbastecimiento) {
        const { id_proveedor, id_producto, cantidad, id_categoria, precio_unitario, total, id_user_creacion } = datosAbastecimiento;

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const queryInsert = `
                INSERT INTO abastecimientos 
                (id_proveedor, id_producto, cantidad, id_categoria, precio_unitario, total, id_user_creacion, fecha_registro)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            `;
            const [result] = await connection.query(queryInsert, [
                id_proveedor, id_producto, cantidad, id_categoria, precio_unitario, total, id_user_creacion
            ]);

            // Actualizar la cantidad del producto en la tabla de productos
            const queryUpdateStock = `
                UPDATE productos 
                SET cantidad_producto = cantidad_producto + ?
                WHERE id = ? AND id_categoria = ?
            `;
            await connection.query(queryUpdateStock, [cantidad, id_producto, id_categoria]);

            await connection.commit();
            return { success: true, id: result.insertId };
        } catch (error) {
            await connection.rollback();
            throw new Error('Error al registrar el abastecimiento: ' + error.message);
        } finally {
            connection.release();
        }
    }

    async obtenerCategoriasActivas() {
        const query = `SELECT id, nombre_categoria FROM categorias WHERE estado_categoria = 'activo'`;
        const [categorias] = await db.query(query);
        return categorias;
    }

    async obtenerProveedoresPorCategoria(idCategoria) {
        const query = `
            SELECT p.id, p.nombre_proveedor
            FROM proveedores p
            INNER JOIN proveedor_categoria pc ON p.id = pc.id_proveedor
            WHERE pc.id_categoria = ? AND p.estado_proveedor = 'activo' AND pc.estado = 'activo'
        `;
        const [proveedores] = await db.query(query, [idCategoria]);
        return proveedores;
    }

    async obtenerProductosPorCategoria(idCategoria) {
        const query = `
            SELECT id, nombre_producto, marca_producto, cantidad_producto
            FROM productos 
            WHERE id_categoria = ? AND estado_producto = 'activo'
        `;
        const [productos] = await db.query(query, [idCategoria]);
        return productos;
    }
}

export default new abastecimientoDAO();
