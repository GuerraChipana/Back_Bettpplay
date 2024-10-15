import userService from '../services/userService.js';

const obtenerUsuarioController = async (req, res) => {
    const { id } = req.user;

    try {
        const usuario = await userService.obtenerUsuarioPorId(id);
        res.json(usuario);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

const listarUsuariosController = async (req, res) => {
    try {
        const usuarios = await userService.listarUsuarios();
        res.json(usuarios);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

const registrarAdminController = async (req, res) => {
    const { nombre_usuario, apellido_usuario, usuario, email_usuario, contraseña_usuario, rol_usuario } = req.body;

    if (req.user.rol !== 'superadministrador' && req.user.rol !== 'administrador') {
        return res.status(403).json({ message: 'Acceso denegado. Solo el superadministrador o administrador puede registrar usuarios.' });
    }

    if (!nombre_usuario || !apellido_usuario || !usuario || !email_usuario || !contraseña_usuario || !rol_usuario) {
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }
    if (usuario.length < 6) {
        return res.status(400).json({ message: 'El nombre de usuario debe tener más de 5 caracteres.' });
    }
    if (contraseña_usuario.length < 6) {
        return res.status(400).json({ message: 'La contraseña debe tener más de 5 caracteres.' });
    }
    if (email_usuario.length < 11 || !email_usuario.endsWith('@gmail.com')) {
        return res.status(400).json({ message: 'El correo electrónico debe tener más de 10 caracteres y terminar con "@gmail.com".' });
    }

    try {
        const nuevoAdmin = await userService.registrarAdmin({ 
            nombre_usuario, 
            apellido_usuario, 
            usuario, 
            email_usuario, 
            contraseña_usuario, 
            rol_usuario, 
            id_user_creacion: req.user.id 
        });
        res.status(201).json({ message: 'Registrado exitosamente', usuario: nuevoAdmin });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

const cambiarEstadoUsuarioController = async (req, res) => {
    const { id } = req.params;
    const { estado_usuario } = req.body;

    if (req.user.rol !== 'superadministrador' && req.user.rol !== 'administrador') {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }

    try {
        await userService.cambiarEstadoUsuario(id, estado_usuario, req.user.id);
        res.json({ message: `Estado del usuario cambiado a ${estado_usuario ? 'activo' : 'inactivo'}` });
    } catch (error) {
        res.status(error.status).json({ message: error.message });
    }
};

const eliminarUsuarioController = async (req, res) => {
    const { id } = req.params;

    if (req.user.rol !== 'superadministrador') {
        return res.status(403).json({ message: 'Acceso denegado. Solo el superadministrador puede eliminar usuarios.' });
    }

    try {
        await userService.eliminarUsuario(id);
        res.json({ message: 'Usuario eliminado exitosamente.' });
    } catch (error) {
        res.status(error.status).json({ message: error.message });
    }
};

const editarUsuarioController = async (req, res) => {
    const { id } = req.user;
    const { nombre_usuario, apellido_usuario, email_usuario, contraseña_usuario } = req.body;

    try {
        const usuarioActualizado = await userService.editarUsuario(id, {
            nombre_usuario,
            apellido_usuario,
            email_usuario,
            contraseña_usuario
        });
        res.json({ message: 'Usuario actualizado exitosamente.', usuario: usuarioActualizado });
    } catch (error) {
        res.status(error.status).json({ message: error.message });
    }
};

const cambiarRolUsuarioController = async (req, res) => {
    const { id } = req.params;
    const { rol_usuario } = req.body;

    if (req.user.rol !== 'superadministrador') {
        return res.status(403).json({ message: 'Acceso denegado. Solo el superadministrador puede cambiar el rol de los usuarios.' });
    }

    try {
        await userService.cambiarRolUsuario(id, rol_usuario, req.user.id);
        res.json({ message: `Rol del usuario cambiado a ${rol_usuario}` });
    } catch (error) {
        res.status(error.status).json({ message: error.message });
    }
};

export {
    obtenerUsuarioController,
    listarUsuariosController,
    registrarAdminController,
    cambiarEstadoUsuarioController,
    eliminarUsuarioController,
    editarUsuarioController,
    cambiarRolUsuarioController
};
