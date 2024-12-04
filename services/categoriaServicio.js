import categoriaDAO from "../daos/categoriaDAO.js";

class CategoriaServicio {

    // Servicio para agregar una nueva categoria
    async agregarCategoria(datosCategoria, file) {
        const { nombre_categoria, detalle_categoria } = datosCategoria;

        // Validaciones de negocio
        if (!file) {
            throw new Error('La imagen es obligatoria');
        } else if (!nombre_categoria) {
            throw new Error("El nombre de la categoria es obligatorio");
        } else if (!detalle_categoria) {
            throw new Error("Detalle la categoria");
        }

        // Una vez hechas las validaciones, llamamos al dao
        return await categoriaDAO.AgregarCategoria(datosCategoria, file);
    }


    // Servicio para editar la categoria
    async editarCategoria(id, datosCategoria, file, id_user_modificacion) {
        const { nombre_categoria, detalle_categoria } = datosCategoria;

        // Validaciones de negocio
        if (!nombre_categoria) {
            throw new Error("El nombre de la categoría es obligatorio");
        }
        if (!detalle_categoria) {
            throw new Error("Detalle de la categoría es obligatorio");
        }     
        
     // Procedemos a llamar al DAO que actualizará la categoría y nos retornará los datos actualizados
        return await categoriaDAO.editarCategoria(id, datosCategoria, file, id_user_modificacion);
    }

    // Servicio para cambiar de estado a la categoria 
    async estadoCategoria(id, estado_categoria, id_user_modificacion) {
        // Validaciones de negocio:
        const estadosPermitidos = ['activo', 'descontinuado']
        if (!estadosPermitidos.includes(estado_categoria)) {
            throw new Error(`El estado ${estado_categoria} no es valido. Los estados permitidos son: ${estadosPermitidos.join(', ')}`);
        }
        // Procedemos a llamar al DAO
        return await categoriaDAO.cambiarEstadoCategoria(id, estado_categoria, id_user_modificacion)
    }

    // Servicio para listar categorias (Trabajador)
    async ListarCategorias() {
        return await categoriaDAO.listarCategorias({})
    }

    // Servicio para listar categorias por nombre (Trabajador)
    async listarCategoriasPorNombre(nombre) {
        return await categoriaDAO.listarCategorias({ nombre });
    }

    // Servicio para listar solo las categorías activas (para clientes)
    async listarCategoriasActivas() {
        return await categoriaDAO.listarCategorias({ estado: 'activo' });
    }

    // Servicio para listar categorías activas por nombre (para clientes)
    async listarCategoriasActivasPorNombre(nombre) {
        return await categoriaDAO.listarCategorias({ estado: 'activo', nombre });
    }
    // Servicio para obtener una categoría por ID (para trabajadores)
    async obtenerCategoriaPorId(id) {
        const categoria = await categoriaDAO.obtenerCategoriaPorId(id);
        return categoria;
    }
    // Servicio para obtener una categoría activa por ID (para clientes)
    async obtenerCategoriaActivaPorId(id) {
        const categoria = await categoriaDAO.obtenerCategoriaActivaPorId(id);
        return categoria;
    }

}

export default new CategoriaServicio();