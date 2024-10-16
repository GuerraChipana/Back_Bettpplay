import usuarioServicio from '../services/usuarioServicio.js';

export const listarUsuarios = async (req, res) => {
    const rol = req.user.rol;

    try {
        const usuarios = await usuarioServicio.listarUsuarios(rol);
        res.status(200).json(usuarios);
    } catch (error) {
        console.error('Error detectado:', error);
        res.status(500).json({ error: 'Error al listar usuarios: ' + error.message });
    }
};

export const editarUsuario = async (req, res) => {
    const { id } = req.params;
    const { nombre_usuario, apellido_usuario, usuario, email_usuario, rol_usuario } = req.body;
    const id_usuario_modificacion = req.user.id;
    const rol = req.user.rol;

    try {
        const usuarioActualizado = await usuarioServicio.editarUsuario(id, { nombre_usuario, apellido_usuario, usuario, email_usuario, rol_usuario }, id_usuario_modificacion, rol);
        res.status(200).json({ message: 'Usuario actualizado exitosamente', usuario: usuarioActualizado });
    } catch (error) {
        console.error('Error detectado:', error);
        res.status(500).json({ error: 'Error al editar usuario: ' + error.message });
    }
};

export const cambiarEstadoUsuario = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    const id_usuario_modificacion = req.user.id;
    const rol = req.user.rol;

    try {
        const usuarioActualizado = await usuarioServicio.cambiarEstadoUsuario(id, estado, id_usuario_modificacion, rol);
        res.status(200).json({ message: 'Estado del usuario actualizado exitosamente', usuario: usuarioActualizado });
    } catch (error) {
        console.error('Error detectado:', error);
        res.status(500).json({ error: 'Error al cambiar el estado del usuario: ' + error.message });
    }
};

export const contratarUsuario = async (req, res) => {
    const { nombre_usuario, apellido_usuario, usuario, email_usuario, contraseña_usuario, rol_usuario } = req.body;
    const id_user_creacion = req.user.id;
    const rol = req.user.rol;

    try {
        // Verificar el rol del usuario que realiza la contratación
        if (rol === 'administrador' && rol_usuario !== 'empleado') {
            return res.status(403).json({ message: 'El administrador solo puede contratar empleados.' });
        }

        await usuarioServicio.agregarUsuario({ nombre_usuario, apellido_usuario, usuario, email_usuario, contraseña_usuario, rol_usuario, id_user_creacion });
        res.status(201).json({ message: 'Usuario contratado exitosamente' });
    } catch (error) {
        console.error('Error detectado:', error);
        res.status(500).json({ error: 'Error al contratar usuario: ' + error.message });
    }
};

