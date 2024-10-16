import usuarioDAO from '../daos/usuarioDAO.js';

class UsuarioServicio {
    async listarUsuarios(rol) {
        const usuarios = await usuarioDAO.listarUsuarios();
        return rol === 'administrador' 
            ? usuarios.filter(usuario => usuario.rol_usuario === 'empleado') 
            : usuarios;
    }

    async editarUsuario(id, datosUsuario, id_usuario_modificacion, rol) {
        if (rol === 'administrador') {
            const usuario = await usuarioDAO.obtenerUsuarioPorId(id);
            if (!usuario || usuario.rol_usuario !== 'empleado') {
                throw new Error('El administrador solo puede editar empleados.');
            }
        }
        return await usuarioDAO.editarUsuario(id, datosUsuario, id_usuario_modificacion);
    }

    async cambiarEstadoUsuario(id, estado, id_usuario_modificacion, rol) {
        if (rol === 'administrador') {
            const usuario = await usuarioDAO.obtenerUsuarioPorId(id);
            if (!usuario || usuario.rol_usuario !== 'empleado') {
                throw new Error('El administrador solo puede cambiar el estado de empleados.');
            }
        }
        return await usuarioDAO.cambiarEstadoUsuario(id, estado, id_usuario_modificacion);
    }

    async agregarUsuario(datosUsuario) {
        return await usuarioDAO.agregarUsuario(datosUsuario);
    }
}

export default new UsuarioServicio();
