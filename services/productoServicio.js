
import productoDAO from '../daos/productoDAO.js';

// Servicio para agregar un nuevo producto
export async function agregarProducto(datosProducto, file) {
    const { nombre_producto, marca_producto, precio_producto } = datosProducto;

    // Validaciones de negocio
    if (!nombre_producto || !marca_producto || !precio_producto) {
        throw new Error('El nombre, la marca y el precio son obligatorios.');
    }

    if (precio_producto <= 0) {
        throw new Error('El precio del producto debe ser mayor a cero.');
    }

    // Una vez hecho las validaciones pasamos a llamar al dao
    return await productoDAO.agregarProducto(datosProducto, file);
}

// Servicio para editar un producto existente
export async function editarProducto(id, datosProducto, file, id_user_modificacion) {
    const { nombre_producto, marca_producto, precio_producto } = datosProducto;

    // Validaciones de negocio
    if (!nombre_producto || !marca_producto) {
        throw new Error('El nombre y la marca son obligatorios.');
    }

    if (precio_producto && precio_producto <= 0) {
        throw new Error('El precio del producto debe ser mayor a cero.');
    }

    // Una vez hecho las validaciones pasamos a llamar al dao
    return await productoDAO.editarProducto(id, datosProducto, file, id_user_modificacion);
}

// Servicio para listar todos los productos (para administradores)
export async function listarProductos() {
    return await productoDAO.listarProductos({}); 
}

// Servicio para listar productos por categoría (para administradores)
export async function listarProductosPorCategoria(categoriaId) {
    return await productoDAO.listarProductos({ categoriaId });
}

// Servicio para listar productos por marca (para administradores)
export async function listarProductosPorMarca(marca) {
    return await productoDAO.listarProductos({ marca });
}

// Servicio para listar solo los productos activos (para clientes)
export async function listarProductosActivos() {
    return await productoDAO.listarProductos({ estado: 'activo' });
}

// Servicio para listar productos activos por categoría (para clientes)
export async function listarProductosActivosPorCategoria(categoriaId) {
    return await productoDAO.listarProductos({ estado: 'activo', categoriaId });
}

// Servicio para listar productos activos por marca (para clientes)
export async function listarProductosActivosPorMarca(marca) {
    return await productoDAO.listarProductos({ estado: 'activo', marca });
}


// Servicio para cambiar el estado de un producto
export async function cambiarEstadoProducto(id, estado, id_user_modificacion) {

    // Validaciones de negocio
    const estadosPermitidos = ['activo', 'desmantelado'];

    if (!estadosPermitidos.includes(estado)) {
        throw new Error(`El estado ${estado} no es válido. Los estados permitidos son: ${estadosPermitidos.join(', ')}`);
    }

    // Una vez hecho las validaciones pasamos a llamar al dao
    return await productoDAO.cambiarEstadoProducto(id, estado, id_user_modificacion);
}

// Servicio para actualizar el estado del producto según la cantidad disponible
export async function actualizarEstadoPorCantidad(productId) {
    return await productoDAO.actualizarEstadoPorCantidad(productId);
}

