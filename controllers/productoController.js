import { agregarProducto, editarProducto } from '../services/productoServicio.js';

export const crearProducto = async (req, res) => {
    try {
        const file = req.files?.imagen;

        if (!file) {
            return res.status(400).json({ error: 'No se ha recibido ninguna imagen' });
        }

        if (!file.mimetype.startsWith('image/')) {
            return res.status(400).json({ error: 'El archivo debe ser una imagen' });
        }

        const { nombre_producto, descripcion_producto, marca_producto, precio_producto, categoria_id, id_user_creacion } = req.body;

        // Verificar que todos los datos requeridos estén presentes
        if (!nombre_producto || !descripcion_producto || !marca_producto || !precio_producto || !categoria_id || !id_user_creacion) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        // Guardar el producto y obtener la URL de la imagen
        const imageUrl = await agregarProducto(req.body, file);

        // Enviar la respuesta con la URL de la imagen
        res.status(201).json({
            message: 'Producto agregado exitosamente',
            imageUrl: imageUrl,
        });
    } catch (error) {
        console.error('Error detectado:', error);
        res.status(500).json({ error: error.message });
    }
};

export const modificarProducto = async (req, res) => {
    const { id } = req.params;
    const file = req.files?.imagen;
    const id_user_modificacion = req.user.id; 

    try {
        const datosProducto = req.body;
        const productoActualizado = await editarProducto(id, datosProducto, file, id_user_modificacion);

        res.status(200).json({
            message: 'Producto actualizado exitosamente',
            producto: productoActualizado,
        });
    } catch (error) {
        console.error('Error detectado:', error);
        res.status(500).json({ error: error.message });
    }
};
