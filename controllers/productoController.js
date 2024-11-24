import productosService from '../services/productoServicio.js';

// ------------------- Controladores para Administradores -------------------

// Crear un producto
export const crearProducto = async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ error: 'No se ha recibido ninguna imagen' });

        const id_user_creacion = req.user.id;
        const productoId = await productosService.agregarProducto({ ...req.body, id_user_creacion }, file);

        res.status(201).json({
            message: 'Producto agregado exitosamente',
            productoId,

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
        const file = req.file;
        const id_user_modificacion = req.user.id;

        const productoActualizado = await productosService.editarProducto(id, req.body, file, id_user_modificacion);

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
        const productos = await productosService.listarProductos();
        res.status(200).json(productos);
    } catch (error) {
        console.error('Error detectado:', error);
        res.status(500).json({ error: error.message });
    }
};

// Listar productos por categoría (Administrador)
export const obtenerProductosPorCategoria = async (req, res) => {
    try {
        const { id_categoria } = req.params;
        const productos = await productosService.listarProductosPorCategoria(id_categoria);
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
        const productos = await productosService.listarProductosPorMarca(marca);
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

        const productoActualizado = await productosService.cambiarEstadoProducto(id, estado, id_user_modificacion);

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
        const productos = await productosService.listarProductosActivos();
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
        const productos = await productosService.listarProductosActivosPorCategoria(categoriaId);
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
        const productos = await productosService.listarProductosActivosPorMarca(marca);
        res.status(200).json(productos);
    } catch (error) {
        console.error('Error detectado:', error);
        res.status(500).json({ error: error.message });
    }
};
