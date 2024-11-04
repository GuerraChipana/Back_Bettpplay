import carritoService from '../services/carritoService.js';

class CarritoController {
    // Agregar un producto al carrito
    static async agregarProducto(req, res) {
        const { id_producto, cantidad } = req.body;
        const id_cliente = req.user.id;  // Obtener id_cliente del token
        try {
            await carritoService.agregarProductoAlCarrito(id_cliente, id_producto, cantidad);
            res.status(200).json({ mensaje: 'Producto agregado al carrito' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // Obtener el carrito de un cliente
    static async obtenerCarrito(req, res) {
        const id_cliente = req.user.id;  // Obtener id_cliente del token
        try {
            const carrito = await carritoService.obtenerCarritoPorCliente(id_cliente);
            // Estructuramos los detalles del carrito
            const carritoConDetalles = carrito.map(item => ({
                id: item.id,
                nombre_producto: item.nombre_producto,
                imagen: item.imagen,
                precio_producto: item.precio_producto,
                cantidad: item.cantidad,
            }));
            res.status(200).json(carritoConDetalles);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // Crear una orden
    static async crearOrden(req, res) {
        const { metodo_pago, direccion_envio, ciudad } = req.body;
        const id_cliente = req.user.id;  // Obtener id_cliente del token
        try {
            const id_orden = await carritoService.crearOrden(id_cliente, metodo_pago, direccion_envio, ciudad);
            res.status(201).json({ mensaje: 'Orden creada', id_orden });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // Obtener las órdenes de un cliente
    static async obtenerOrdenes(req, res) {
        const id_cliente = req.user.id;  // Obtener id_cliente del token
        try {
            const ordenes = await carritoService.obtenerOrdenesPorCliente(id_cliente);
            // Aquí puedes estructurar la respuesta si es necesario
            const ordenesConDetalles = ordenes.map(orden => ({
                id: orden.id,
                fecha_orden: orden.fecha_orden,
                total: orden.total,
                estado: orden.estado,
            }));
            res.status(200).json(ordenesConDetalles);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // Obtener todas las órdenes (para administrador)
    static async obtenerTodasLasOrdenes(req, res) {
        try {
            const ordenes = await carritoService.obtenerTodasLasOrdenes();
            res.status(200).json(ordenes);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // Actualizar la cantidad de un producto en el carrito
    static async actualizarCantidad(req, res) {
        const { id_producto, cantidad } = req.body;
        const id_cliente = req.user.id;  // Obtener id_cliente del token
        try {
            await carritoService.actualizarCantidadProducto(id_cliente, id_producto, cantidad);
            res.status(200).json({ mensaje: 'Cantidad actualizada' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // Eliminar un producto del carrito
    static async eliminarProducto(req, res) {
        const id_producto = req.params.id_producto;
        const id_cliente = req.user.id;  // Obtener id_cliente del token
        try {
            await carritoService.eliminarProductoDelCarrito(id_cliente, id_producto);
            res.status(200).json({ mensaje: 'Producto eliminado del carrito' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

export default CarritoController;
