import categoriaServicio from "../services/categoriaServicio.js";

// ------------ Controladores para Administradores/Empleados -------------- //



// Crear categoria 
export const crearCategoria = async (req, res) => {
    try {
        // Extraemos la imagen de la solicitud
        const file = req.files?.imagen_categoria;
        if (!file) {
            return res.status(400).json({ error: 'No se ha recibido ninguna imagen' });
        }

        // Obtenemos el ID del usuario que crea la categoría
        const id_user_creacion = req.user.id;

        // Llamamos al servicio para agregar la categoría
        const categoriaId = await categoriaServicio.agregarCategoria({ ...req.body, id_user_creacion }, file);

        // Devolvemos una respuesta exitosa
        return res.status(201).json({
            message: 'Categoria agregada exitosamente',
            categoriaId
        });
    } catch (error) {
        // Manejo de errores
        console.error('Error detectado:', error);
        res.status(500).json({ error: error.message });
    }
};

export const modificarCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const file = req.files?.imagen; 
        const id_user_modificacion = req.user.id;

        // Verifica si file existe
        if (!file) {
            return res.status(400).json({ error: 'No se ha recibido ninguna imagen' });
        }

        const categoriaActualizada = await categoriaServicio.editarCategoria(id, req.body, file, id_user_modificacion);

        res.status(200).json({
            message: 'Categoría actualizada exitosamente',
            categoria: categoriaActualizada 
        });
    } catch (error) {
        console.error('Error detectado:', error);
        res.status(500).json({ error: error.message });
    }
};

// Listar todas las categorias 
export const obtenerCategorias = async (req, res) => {
    try {
        // Listamos todos los productos
        const listacategoria = await categoriaServicio.ListarCategorias();

        res.status(200).json(listacategoria);

    } catch (error) {
        console.error('Error detectado', error);
        res.status(500).json({ error: error.message });
    }
};

// Listar categorias por nombre 
export const obtenerCategoriasPorNombre = async (req, res) => {
    try {
        const { nombre } = req.params;
        const categorias = await categoriaServicio.listarCategoriasPorNombre(nombre);
        res.status(200).json(categorias);
    } catch (error) {
        console.error('Error detectado:', error);
        res.status(500).json({ error: error.message });
    }
};

// Cambiar estado de la categoria
export const cambiarEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado_categoria } = req.body;
        const id_user_modificacion = req.user.id;

        const categoriaActualizada = await categoriaServicio.estadoCategoria(id, estado_categoria, id_user_modificacion);

        res.status(200).json({
            message: 'Estado de la categoria actualizada exitosamente',
            categoria: categoriaActualizada
        });
    } catch (error) {
        console.error('Error detectado', error);
        res.status(500).json({ error: error.message });
    }
};


// ------------ Controladores para el cliente  -------------- //

// Listar categorias activas
export const obtenerCategoriasActivas = async (req, res) => {
    try {
        const categoria = await categoriaServicio.listarCategoriasActivas();
        res.status(200).json(categoria);
    } catch (error) {
        console.error('Error detectado:', error);
        res.status(500).json({ error: error.message });
    }
};

// Listar categorias activas por nombre 
export const obtenerCategoriasActivasPorNombre = async (req, res) => {
    try {
        const { nombre } = req.params;
        const categoria = await categoriaServicio.listarCategoriasActivasPorNombre(nombre);
        res.status(200).json(categoria);
    } catch (error) {
        console.error('Error detectado:', error);
        res.status(500).json({ error: error.message });
    }
};