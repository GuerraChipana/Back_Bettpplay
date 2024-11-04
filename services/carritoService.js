import carritoDAO from '../daos/carritoDAO.js';
import productoDAO from '../daos/productoDAO.js';

class CarritoService {
    // Agregar un producto al carrito
    async agregarProductoAlCarrito(id_cliente, id_producto, cantidad) {
        const producto = await productoDAO.buscarProductoPorId(id_producto);
        if (!producto) throw new Error('Producto no encontrado');
        if (producto.cantidad_producto < cantidad) throw new Error('No hay suficiente stock disponible');

        await carritoDAO.agregarProductoAlCarrito(id_cliente, id_producto, cantidad);
    }

    // Obtener el carrito de un cliente
    async obtenerCarritoPorCliente(id_cliente) {
        return await carritoDAO.obtenerCarritoPorCliente(id_cliente);
    }

// Método para cancelar órdenes pendientes
async cancelarOrdenesPendientes(id_cliente) {
    await carritoDAO.cancelarOrdenesPendientes(id_cliente);
}

// Crear una orden a partir del carrito
async crearOrden(id_cliente, metodo_pago, direccion_envio, ciudad) {
    const carrito = await carritoDAO.obtenerCarritoPorCliente(id_cliente);
    if (carrito.length === 0) throw new Error('El carrito está vacío');

    // Verificar si hay órdenes pendientes y cancelarlas
    await this.cancelarOrdenesPendientes(id_cliente);

    // Validar el stock de los productos en el carrito y almacenar los IDs y cantidades
    const productosAActualizar = [];
    for (const item of carrito) {
        const producto = await productoDAO.buscarProductoPorId(item.id);
        if (producto.cantidad_producto < item.cantidad) {
            throw new Error(`No hay suficiente stock para el producto: ${producto.nombre_producto}`);
        }
        productosAActualizar.push({
            id_producto: item.id,
            cantidad: item.cantidad,
        });
    }

    const total = carrito.reduce((acc, item) => acc + (item.precio_producto * item.cantidad), 0);

    // Crear la orden y obtener su ID
    const id_orden = await carritoDAO.crearOrden({ id_cliente, total, metodo_pago, direccion_envio, ciudad });

    // Actualizar el estado de la orden a "completada"
    await carritoDAO.actualizarEstadoOrden(id_orden, 'completada');

    // Agregar detalles de la orden
    await carritoDAO.agregarDetallesOrden(id_orden, carrito.map(item => ({
        id_producto: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_producto,
        total: item.precio_producto * item.cantidad
    })));

    // Actualizar la cantidad de productos en la base de datos
    for (const { id_producto, cantidad } of productosAActualizar) {
        await productoDAO.reducirCantidadProducto(id_producto, cantidad);
    }

    // Vaciar el carrito después de la compra
    await carritoDAO.vaciarCarrito(id_cliente);

    return id_orden; // Retornar el ID de la nueva orden
}

    // Obtener las órdenes de un cliente
    async obtenerOrdenesPorCliente(id_cliente) {
        return await carritoDAO.obtenerOrdenesPorCliente(id_cliente);
    }

    // Obtener todas las órdenes (para administrador)
    async obtenerTodasLasOrdenes() {
        return await carritoDAO.obtenerTodasLasOrdenes();
    }

    // Actualizar la cantidad de un producto en el carrito
    async actualizarCantidadProducto(id_cliente, id_producto, cantidad) {
        const producto = await productoDAO.buscarProductoPorId(id_producto);
        if (!producto) throw new Error('Producto no encontrado');
        if (producto.cantidad_producto < cantidad) throw new Error('No hay suficiente stock disponible');

        await carritoDAO.actualizarCantidad(id_cliente, id_producto, cantidad);
    }

    // Eliminar un producto del carrito
    async eliminarProductoDelCarrito(id_cliente, id_producto) {
        await carritoDAO.eliminarProducto(id_cliente, id_producto);
    }
}

export default new CarritoService();
