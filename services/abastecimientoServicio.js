import abastecimientoDAO from '../daos/abastecimientoDAO.js';

class abastecimientoServicio {
    async listarAbastecimientos() {
        try {
            return await abastecimientoDAO.listarAbastecimientos();
        } catch (error) {
            throw new Error('Error al listar los abastecimientos: ' + error.message);
        }
    }

    async registrarAbastecimiento(datosAbastecimiento) {
        const { id_proveedor, id_categoria, marca_producto, id_producto, cantidad, precio_unitario } = datosAbastecimiento;
    
        // Validar que el proveedor sea activo
        const proveedorActivo = await abastecimientoDAO.validarProveedorActivo(id_proveedor);
        if (!proveedorActivo) {
            throw new Error('El proveedor seleccionado no está activo.');
        }
    
        // Validar que la marca pertenece a la categoría
        const marcaValida = await abastecimientoDAO.validarMarcaPorCategoria(marca_producto, id_categoria);
        if (!marcaValida) {
            throw new Error('La marca seleccionada no pertenece a la categoría.');
        }
    
        // Validar que el producto pertenece a la marca y la categoría
        const productos = await abastecimientoDAO.obtenerProductosPorMarcaYCategoria(marca_producto, id_categoria);
        const producto = productos.find(p => p.id === id_producto);
        if (!producto) {
            throw new Error('El producto seleccionado no pertenece a la marca y categoría especificadas.');
        }
    
        // Obtener la cantidad actual del producto
        const cantidadActual = producto.cantidad_producto;
    
        // Calcular la nueva cantidad
        const nuevaCantidad = cantidadActual + cantidad;
    
        // Calcular el total
        const total = cantidad * precio_unitario;
        datosAbastecimiento.total = total;
    
        try {
            await abastecimientoDAO.registrarAbastecimiento(datosAbastecimiento); // Registra el abastecimiento
    
            // Actualizar la cantidad del producto en la base de datos
            await abastecimientoDAO.actualizarCantidadProducto(id_producto, nuevaCantidad);
    
            return { nuevaCantidad, cantidad, total };
        } catch (error) {
            throw new Error('Error al registrar el abastecimiento: ' + error.message);
        }
    }
    
    async obtenerCategoriasActivas() {
        try {
            return await abastecimientoDAO.obtenerCategoriasActivas();
        } catch (error) {
            throw new Error('Error al obtener categorías activas: ' + error.message);
        }
    }

    async obtenerProveedoresPorCategoria(idCategoria) {
        try {
            return await abastecimientoDAO.obtenerProveedoresPorCategoria(idCategoria);
        } catch (error) {
            throw new Error('Error al obtener proveedores por categoría: ' + error.message);
        }
    }

    async obtenerProductosPorCategoria(idCategoria) {
        try {
            return await abastecimientoDAO.obtenerProductosPorCategoria(idCategoria);
        } catch (error) {
            throw new Error('Error al obtener productos por categoría: ' + error.message);
        }
    }
    async obtenerDetallesProducto(idProducto) {
        try {
            return await abastecimientoDAO.obtenerDetallesProducto(idProducto);
        } catch (error) {
            throw new Error('Error al obtener detalles del producto: ' + error.message);
        }
    }
    
    async obtenerDetallesCategoria(idCategoria) {
        try {
            return await abastecimientoDAO.obtenerDetallesCategoria(idCategoria);
        } catch (error) {
            throw new Error('Error al obtener detalles de la categoría: ' + error.message);
        }
    }
    
    async obtenerDetallesProveedor(idProveedor) {
        try {
            return await abastecimientoDAO.obtenerDetallesProveedor(idProveedor);
        } catch (error) {
            throw new Error('Error al obtener detalles del proveedor: ' + error.message);
        }
    }
    
}

export default new abastecimientoServicio();
