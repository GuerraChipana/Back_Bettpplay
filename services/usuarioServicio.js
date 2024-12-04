import bcrypt from 'bcryptjs'; // Asegúrate de importar bcrypt
import usuarioDAO from '../daos/usuarioDAO.js';

class UsuarioServicio {
    // validaciones
    validarUsuario(datosUsuario, isEdit = false) {
        const { usuario, email_usuario, contraseña_usuario } = datosUsuario;

        if (usuario.length <= 5) {
            throw new Error('El nombre de usuario debe tener más de 5 caracteres.');
        }
        if (contraseña_usuario.length <= 5) {
            throw new Error('La contraseña debe tener más de 5 caracteres.');
        }
        if (!email_usuario.endsWith('@gmail.com')) {
            throw new Error('El correo electrónico debe terminar en @gmail.com.');
        }
    }

    async listarUsuarios(rol) {
        const usuarios = await usuarioDAO.listarUsuarios();
        return rol === 'administrador'
            ? usuarios.filter(usuario => usuario.rol_usuario === 'empleado')
            : usuarios;
    }

    async editarMisDatos(id_usuario_modificacion, datosUsuario) {

        const usuarioActual = await usuarioDAO.obtenerUsuarioPorId(id_usuario_modificacion);

        // Verificar la contraseña actual
        const esContraseñaCorrecta = await bcrypt.compare(datosUsuario.contraseña_actual, usuarioActual.contraseña_usuario);
        if (!esContraseñaCorrecta) {
            throw new Error('La contraseña actual es incorrecta.');
        }

        // Si se proporciona una nueva contraseña
        if (datosUsuario.contraseña_nueva) {
            if (datosUsuario.contraseña_nueva !== datosUsuario.confirmacion_contraseña) {
                throw new Error('La nueva contraseña y la confirmación no coinciden.');
            }
            const salt = await bcrypt.genSalt(10);
            datosUsuario.contraseña_usuario = await bcrypt.hash(datosUsuario.contraseña_nueva, salt);
        }

        // Actualizar el usuario con los datos proporcionados
        return await usuarioDAO.editarUsuario(id_usuario_modificacion, datosUsuario);


    }

    async obtenerUsuarioPorId(id) {
        return await usuarioDAO.obtenerUsuarioPorId(id);
    }

    async cambiarRolUsuario(id, nuevoRol, id_usuario_modificacion, rol) {
        console.log('Rol del usuario que intenta cambiar el rol:', rol); // Log del rol

        if (rol !== 'superadministrador') {
            throw new Error('No tienes permiso para cambiar el rol de usuarios.');
        }

        const rolesValidos = ['empleado', 'administrador', 'superadministrador'];
        if (!rolesValidos.includes(nuevoRol)) {
            throw new Error('El rol proporcionado no es válido.');
        }

        const usuario = await usuarioDAO.obtenerUsuarioPorId(id);
        if (!usuario) {
            throw new Error('Usuario no encontrado.');
        }

        return await usuarioDAO.cambiarRolUsuario(id, nuevoRol, id_usuario_modificacion);
    }

    async cambiarEstadoUsuario(id, estado, id_usuario_modificacion, rol) {
        if (typeof estado === 'undefined') {
            throw new Error('El estado es requerido');
        }

        if (!['activo', 'inactivo'].includes(estado)) {
            throw new Error('El estado debe ser "activo" o "inactivo"');
        }

        // Validacion del rol del usuario
        if (rol === 'administrador') {
            const usuario = await usuarioDAO.obtenerUsuarioPorId(id);
            if (usuario.rol_usuario === 'superadministrador') {
                throw new Error('El administrador solo puede cambiar el estado al empleado');
            }
        }

        return await usuarioDAO.cambiarEstadoUsuario(id, estado, id_usuario_modificacion);
    }

    async agregarUsuario(datosUsuario) {
        this.validarUsuario(datosUsuario); // Validaciones

        // Verificar si el usuario o correo ya existe
        const existeUsuario = await usuarioDAO.obtenerUsuarioPorNombre(datosUsuario.usuario);
        const existeEmail = await usuarioDAO.obtenerUsuarioPorEmail(datosUsuario.email_usuario);

        if (existeUsuario) {
            throw new Error('Ya existe un usuario con ese nombre de usuario.');
        }
        if (existeEmail) {
            throw new Error('Ya existe un usuario con ese correo electrónico.');
        }

        // Codificar la contraseña
        const salt = await bcrypt.genSalt(10);
        const contraseñaCodificada = await bcrypt.hash(datosUsuario.contraseña_usuario, salt);

        // Guardar el usuario con la contraseña codificada
        return await usuarioDAO.agregarUsuario({
            ...datosUsuario,
            contraseña_usuario: contraseñaCodificada
        });
    }

    async obtenerUsuarioPorEmail(emailUsuario, id = null) {
        return await usuarioDAO.obtenerUsuarioPorEmail(emailUsuario, id);
    }

    async obtenerUsuarioPorNombre(nombreUsuario, id = null) {
        return await usuarioDAO.obtenerUsuarioPorNombre(nombreUsuario, id);
    }
}

export default new UsuarioServicio();
