import categoriaServicio from "../services/categoriaServicio.js";

class CategoriaController {
    // Crear categoría 
    async crearCategoria(req, res) {
        try {
            const file = req.files?.imagen_categoria;
            if (!file) {
                return res.status(400).json({ error: 'No se ha recibido ninguna imagen' });
            }

            const id_user_creacion = req.user.id;
            const categoriaId = await categoriaServicio.agregarCategoria({ ...req.body, id_user_creacion }, file);

            return res.status(201).json({
                message: 'Categoría agregada exitosamente',
                categoriaId
            });
        } catch (error) {
            console.error('Error detectado:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Modificar categoría
    async modificarCategoria(req, res) {
        try {
            const { id } = req.params;
            const file = req.files?.imagen; 
            const id_user_modificacion = req.user.id;

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
    }

    // Listar todas las categorías 
    async obtenerCategorias(req, res) {
        try {
            const listacategoria = await categoriaServicio.ListarCategorias();
            res.status(200).json(listacategoria);
        } catch (error) {
            console.error('Error detectado', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Listar categorías por nombre 
    async obtenerCategoriasPorNombre(req, res) {
        try {
            const { nombre } = req.params;
            const categorias = await categoriaServicio.listarCategoriasPorNombre(nombre);
            res.status(200).json(categorias);
        } catch (error) {
            console.error('Error detectado:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Cambiar estado de la categoría
    async cambiarEstado(req, res) {
        try {
            const { id } = req.params;
            const { estado_categoria } = req.body;
            const id_user_modificacion = req.user.id;

            const categoriaActualizada = await categoriaServicio.estadoCategoria(id, estado_categoria, id_user_modificacion);
            res.status(200).json({
                message: 'Estado de la categoría actualizado exitosamente',
                categoria: categoriaActualizada
            });
        } catch (error) {
            console.error('Error detectado', error);
            res.status(500).json({ error: error.message });
        }
    }


    // Esto es para los clientes

    // Listar categorías activas
    async obtenerCategoriasActivas(req, res) {
        try {
            const categoria = await categoriaServicio.listarCategoriasActivas();
            res.status(200).json(categoria);
        } catch (error) {
            console.error('Error detectado:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Listar categorías activas por nombre 
    async obtenerCategoriasActivasPorNombre(req, res) {
        try {
            const { nombre } = req.params;
            const categoria = await categoriaServicio.listarCategoriasActivasPorNombre(nombre);
            res.status(200).json(categoria);
        } catch (error) {
            console.error('Error detectado:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

export default new CategoriaController();
