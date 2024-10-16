import {
    agregarProducto,
    editarProducto,
    listarProductos,
    listarProductosActivos,
    listarProductosPorCategoria,
    listarProductosPorMarca,
    listarProductosActivosPorCategoria,
    listarProductosActivosPorMarca,
    cambiarEstadoProducto,
    actualizarEstadoPorCantidad
} from '../services/productoServicio.js';

// ------------------- Controladores para Administradores -------------------

// Crear un producto
export const crearProducto = async (req, res) => {
    try {
        const file = req.files?.imagen;
        if (!file) return res.status(400).json({ error: 'No se ha recibido ninguna imagen' });

        const id_user_creacion = req.user.id;
        const productoId = await agregarProducto({ ...req.body, id_user_creacion }, file);

        res.status(201).json({
            message: 'Producto agregado exitosamente',
            productoId
        });
    } catch (error) {
        console.error('Error detectado:', error);
        res.status(500).json({ error: error.message });
    }
};

// Modificar un producto
export const modificarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const file = req.files?.imagen;
        const id_user_modificacion = req.user.id;

        const productoActualizado = await editarProducto(id, req.body, file, id_user_modificacion);

        res.status(200).json({
            message: 'Producto actualizado exitosamente',
            producto: productoActualizado
        });
    } catch (error) {
        console.error('Error detectado:', error);
        res.status(500).json({ error: error.message });
    }
};

// Listar todos los productos (Administrador)
export const obtenerProductos = async (req, res) => {
    try {
        // Listar todos los productos
        const productos = await listarProductos();

        // Actualizar el estado de cada producto basado en la cantidad
        for (const producto of productos) {
            await actualizarEstadoPorCantidad(producto.id);
        }

        // Volver a listar los productos después de actualizar el estado
        const productosActualizados = await listarProductos();
        res.status(200).json(productosActualizados);
    } catch (error) {
        console.error('Error detectado:', error);
        res.status(500).json({ error: error.message });
    }
};


// Listar productos por categoría (Administrador)
export const obtenerProductosPorCategoria = async (req, res) => {
    try {
        const { categoriaId } = req.params;
        const productos = await listarProductosPorCategoria(categoriaId);
        res.status(200).json(productos);
    } catch (error) {
        console.error('Error detectado:', error);
        res.status(500).json({ error: error.message });
    }
};

// Listar productos por marca (Administrador)
export const obtenerProductosPorMarca = async (req, res) => {
    try {
        const { marca } = req.params;
        const productos = await listarProductosPorMarca(marca);
        res.status(200).json(productos);
    } catch (error) {
        console.error('Error detectado:', error);
        res.status(500).json({ error: error.message });
    }
};

// Cambiar el estado de un producto
export const cambiarEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        const id_user_modificacion = req.user.id;

        const productoActualizado = await cambiarEstadoProducto(id, estado, id_user_modificacion);

        res.status(200).json({
            message: 'Estado del producto actualizado exitosamente',
            producto: productoActualizado
        });
    } catch (error) {
        console.error('Error detectado:', error);
        res.status(500).json({ error: error.message });
    }
};

// ------------------- Controladores para Clientes -------------------

// Listar productos activos (Cliente)
export const obtenerProductosActivos = async (req, res) => {
    try {
        const productos = await listarProductosActivos();
        res.status(200).json(productos);
    } catch (error) {
        console.error('Error detectado:', error);
        res.status(500).json({ error: error.message });
    }
};

// Listar productos activos por categoría (Cliente)
export const obtenerProductosActivosPorCategoria = async (req, res) => {
    try {
        const { categoriaId } = req.params;
        const productos = await listarProductosActivosPorCategoria(categoriaId);
        res.status(200).json(productos);
    } catch (error) {
        console.error('Error detectado:', error);
        res.status(500).json({ error: error.message });
    }
};

// Listar productos activos por marca (Cliente)
export const obtenerProductosActivosPorMarca = async (req, res) => {
    try {
        const { marca } = req.params;
        const productos = await listarProductosActivosPorMarca(marca);
        res.status(200).json(productos);
    } catch (error) {
        console.error('Error detectado:', error);
        res.status(500).json({ error: error.message });
    }
};
