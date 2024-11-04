import productoDAO from '../daos/productoDAO.js';

class ProductosService {
    // Servicio para agregar un nuevo producto
    async agregarProducto(datosProducto, file) {
        const { nombre_producto, marca_producto, precio_producto, id_categoria } = datosProducto;

        // Validaciones de negocio
        if (!nombre_producto) throw new Error('El nombre es obligatorio.');
        if (!marca_producto) throw new Error('La marca del producto es obligatorio.');
        if (!precio_producto) throw new Error('El precio es obligatorio.');
        if (!id_categoria) throw new Error('La categoría es obligatoria.');
        if (precio_producto <= 0) throw new Error('El precio del producto debe ser mayor a cero.');

        return await productoDAO.agregarProducto(datosProducto, file);
    }

    // Servicio para editar un producto existente
    async editarProducto(id, datosProducto, file, id_user_modificacion) {
        const { nombre_producto, marca_producto, precio_producto, id_categoria } = datosProducto;

        // Validaciones de negocio
        if (!nombre_producto) throw new Error('El nombre es obligatorio.');
        if (!marca_producto) throw new Error('La marca del producto es obligatoria.');
        if (!id_categoria) throw new Error('La categoría es obligatoria.');
        if (precio_producto && precio_producto <= 0) throw new Error('El precio del producto debe ser mayor a cero.');

        return await productoDAO.editarProducto(id, datosProducto, file, id_user_modificacion);
    }

    // Servicio para listar todos los productos (para administradores)
    async listarProductos() {
        return await productoDAO.listarProductosConEstado({ listarTodos: true });
    }

    // Servicio para listar productos por categoría (para administradores)
    async listarProductosPorCategoria(id_categoria) {
        return await productoDAO.listarProductosConEstado({ id_categoria });
    }

    // Servicio para listar productos por marca (para administradores)
    async listarProductosPorMarca(marca) {
        return await productoDAO.listarProductosConEstado({ marca });
    }

    // Servicio para listar solo los productos activos (para clientes)
    async listarProductosActivos() {
        return await productoDAO.listarProductosConEstado({ estado: 'activo' });
    }

    // Servicio para listar productos activos por categoría (para clientes)
    async listarProductosActivosPorCategoria(id_categoria) {
        return await productoDAO.listarProductosConEstado({ estado: 'activo', id_categoria });
    }

    // Servicio para listar productos activos por marca (para clientes)
    async listarProductosActivosPorMarca(marca) {
        return await productoDAO.listarProductosConEstado({ estado: 'activo', marca });
    }

    // Servicio para restar la cantidad de producto
    async restarCantidadProducto(id_producto, cantidad) {
        const producto = await productoDAO.buscarProductoPorId(id_producto);
        if (!producto) throw new Error('Producto no encontrado.');

        if (producto.cantidad_producto < cantidad) {
            throw new Error('Cantidad solicitada excede el stock disponible.');
        }

        producto.cantidad_producto -= cantidad;
        await productoDAO.actualizarProducto(producto);
    }

    // Servicio para cambiar el estado de un producto
    async cambiarEstadoProducto(id, estado, id_user_modificacion) {
        const estadosPermitidos = ['activo', 'descontinuado'];

        if (!estadosPermitidos.includes(estado)) {
            throw new Error(`El estado ${estado} no es válido. Los estados permitidos son: ${estadosPermitidos.join(', ')}`);
        }

        return await productoDAO.cambiarEstadoProducto(id, estado, id_user_modificacion);
    }

    // Servicio para actualizar el estado del producto según la cantidad disponible
    async actualizarEstadoPorCantidad(productId) {
        return await productoDAO.actualizarEstadoPorCantidad(productId);
    }
}

export default new ProductosService();
