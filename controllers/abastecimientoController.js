import abastecimientoServicio from '../services/abastecimientoServicio.js';

class abastecimientoController {
    async listarAbastecimientos(req, res) {
        try {
            const abastecimientos = await abastecimientoServicio.listarAbastecimientos();
            res.status(200).json(abastecimientos);
        } catch (error) {
            console.error('Error al listar los abastecimientos:', error);
            res.status(500).json({ error: 'Error al listar los abastecimientos.' });
        }
    }

    async registrarAbastecimiento(req, res) {
        const id_user_creacion = req.user.id; // Se asume que viene del usuario logueado
        const { id_proveedor, id_categoria, marca_producto, id_producto, cantidad, precio_unitario } = req.body;
    
        const datosAbastecimiento = {
            id_proveedor,
            id_categoria,
            marca_producto,
            id_producto,
            cantidad,
            precio_unitario,
            id_user_creacion
        };
    
        try {
            const response = await abastecimientoServicio.registrarAbastecimiento(datosAbastecimiento);
            
            // Obtener detalles adicionales para la respuesta
            const productoDetalles = await abastecimientoServicio.obtenerDetallesProducto(id_producto);
            const categoriaDetalles = await abastecimientoServicio.obtenerDetallesCategoria(id_categoria);
            const proveedorDetalles = await abastecimientoServicio.obtenerDetallesProveedor(id_proveedor);
    
            res.status(201).json({
                message: 'Abastecimiento registrado con éxito',
                success: true,
                data: {
                    marca_producto: marca_producto,
                    nombre_producto: productoDetalles.nombre_producto,
                    nombre_categoria: categoriaDetalles.nombre_categoria,
                    nombre_proveedor: proveedorDetalles.nombre_proveedor,
                    nueva_cantidad_producto: response.nuevaCantidad, // Nueva cantidad calculada
                    cantidad_total_comprada: cantidad,
                    precio_total: response.total // Precio total calculado
                }
            });
        } catch (error) {
            console.error('Error al registrar el abastecimiento:', error);
            res.status(500).json({ error: error.message });
        }
    }
    
    
    async obtenerCategoriasActivas(req, res) {
        try {
            const categorias = await abastecimientoServicio.obtenerCategoriasActivas();
            res.status(200).json(categorias);
        } catch (error) {
            console.error('Error al obtener categorías activas:', error);
            res.status(500).json({ error: 'Error al obtener categorías activas.' });
        }
    }

    async obtenerProveedoresPorCategoria(req, res) {
        const { idCategoria } = req.params;

        try {
            const proveedores = await abastecimientoServicio.obtenerProveedoresPorCategoria(idCategoria);
            res.status(200).json(proveedores);
        } catch (error) {
            console.error('Error al obtener proveedores por categoría:', error);
            res.status(500).json({ error: 'Error al obtener proveedores por categoría.' });
        }
    }

    async obtenerProductosPorCategoria(req, res) {
        const { idCategoria } = req.params;

        try {
            const productos = await abastecimientoServicio.obtenerProductosPorCategoria(idCategoria);
            res.status(200).json(productos);
        } catch (error) {
            console.error('Error al obtener productos por categoría:', error);
            res.status(500).json({ error: 'Error al obtener productos por categoría.' });
        }
    }
}

export default new abastecimientoController();
