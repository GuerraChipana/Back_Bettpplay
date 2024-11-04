import db from '../database/db.js';

class CarritoDAO {
    // Agregar un producto al carrito
    async agregarProductoAlCarrito(id_cliente, id_producto, cantidad) {
        const queryInsertar = `
            INSERT INTO carrito (id_cliente, id_producto, cantidad) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE cantidad = cantidad + ?`; // Incrementa la cantidad si ya existe
        await db.query(queryInsertar, [id_cliente, id_producto, cantidad, cantidad]);
    }

    // Obtener los productos del carrito de un cliente
    async obtenerCarritoPorCliente(id_cliente) {
        const query = `
            SELECT p.id, p.nombre_producto, p.precio_producto, c.cantidad, p.imagen
            FROM carrito c
            JOIN productos p ON c.id_producto = p.id
            WHERE c.id_cliente = ?`;
        const [carrito] = await db.query(query, [id_cliente]);
        return carrito; // Retorna los productos del carrito
    }

    // Vaciar el carrito de un cliente
    async vaciarCarrito(id_cliente) {
        const query = `DELETE FROM carrito WHERE id_cliente = ?`;
        await db.query(query, [id_cliente]);
    }

    async cancelarOrdenesPendientes(id_cliente) {
        const query = `UPDATE ordenes SET estado = 'cancelada' WHERE id_cliente = ? AND estado = 'pendiente'`;
        await db.query(query, [id_cliente]);
    }

    // Crear una orden
    async crearOrden(orden) {
        const query = `
            INSERT INTO ordenes (id_cliente, total, metodo_pago, direccion_envio, ciudad, estado) 
            VALUES (?, ?, ?, ?, ?, 'pendiente')`; // Establecer el estado como 'pendiente'
        const [result] = await db.query(query, [
            orden.id_cliente,
            orden.total,
            orden.metodo_pago,
            orden.direccion_envio,
            orden.ciudad
        ]);
        return result.insertId; // Retorna el ID de la nueva orden
    }

    // Agregar detalles a la orden
    async agregarDetallesOrden(id_orden, detalles) {
        const query = `
            INSERT INTO detalles_orden (id_orden, id_producto, cantidad, precio_unitario, total) 
            VALUES (?, ?, ?, ?, ?)`;
        for (const detalle of detalles) {
            await db.query(query, [
                id_orden,
                detalle.id_producto,
                detalle.cantidad,
                detalle.precio_unitario,
                detalle.total
            ]);
        }
    }

    // Obtener las órdenes de un cliente
    async obtenerOrdenesPorCliente(id_cliente) {
        const query = `
            SELECT o.id, o.fecha_orden, o.total, o.estado 
            FROM ordenes o 
            WHERE o.id_cliente = ?`;
        const [ordenes] = await db.query(query, [id_cliente]);
        return ordenes; // Retorna las órdenes del cliente
    }

    // Obtener todas las órdenes (para administrador)
    async obtenerTodasLasOrdenes() {
        const query = `
            SELECT o.id AS orden_id, o.id_cliente, o.fecha_orden, o.total, o.estado, c.nombre_cliente
            FROM ordenes o
            JOIN clientes c ON o.id_cliente = c.id
            WHERE o.estado = 'completada'`; // Filtrar solo las órdenes completadas
        const [ordenes] = await db.query(query);
        
        // Agrupar órdenes por cliente
        const resultado = {};
        ordenes.forEach(orden => {
            const { id_cliente, nombre_cliente } = orden;
    
            if (!resultado[id_cliente]) {
                resultado[id_cliente] = {
                    cliente: nombre_cliente,
                    ordenes: []
                };
            }
    
            resultado[id_cliente].ordenes.push({
                orden_id: orden.orden_id,
                fecha_orden: orden.fecha_orden,
                total: orden.total,
                estado: orden.estado
            });
        });
    
        return resultado; // Retorna las órdenes agrupadas por cliente
    }
    

    // Actualizar el estado de una orden
    async actualizarEstadoOrden(id_orden, nuevo_estado) {
        const query = `UPDATE ordenes SET estado = ? WHERE id = ?`;
        await db.query(query, [nuevo_estado, id_orden]);
    }

    // Actualizar la cantidad de un producto en el carrito
    async actualizarCantidad(id_cliente, id_producto, cantidad) {
        const query = `UPDATE carrito SET cantidad = ? WHERE id_cliente = ? AND id_producto = ?`;
        await db.query(query, [cantidad, id_cliente, id_producto]);
    }

    // Eliminar un producto del carrito
    async eliminarProducto(id_cliente, id_producto) {
        const query = `DELETE FROM carrito WHERE id_cliente = ? AND id_producto = ?`;
        await db.query(query, [id_cliente, id_producto]);
    }
}

export default new CarritoDAO();
