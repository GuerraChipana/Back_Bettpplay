import bcrypt from 'bcrypt';
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

export const cambiarRolUsuario = async (req, res) => {
    const { id } = req.params;
    const { rol_usuario } = req.body;
    const id_usuario_modificacion = req.user.id;
    const rol = req.user.rol;

    try {
        if (rol !== 'superadministrador') {
            return res.status(403).json({ message: 'Solo el superadministrador puede cambiar roles.' });
        }

        const usuarioActualizado = await usuarioServicio.cambiarRolUsuario(id, rol_usuario, id_usuario_modificacion, rol);
        res.status(200).json({ message: 'Rol actualizado exitosamente', usuario: usuarioActualizado });
    } catch (error) {
        console.error('Error detectado:', error);
        res.status(500).json({ error: 'Error al cambiar rol: ' + error.message });
    }
};

export const editarMisDatos = async (req, res) => {
    const id_usuario_modificacion = req.user.id;
    const { nombre_usuario, apellido_usuario, usuario, email_usuario, contraseña_actual, contraseña_nueva, confirmacion_contraseña } = req.body;

    try {
        const datosUsuario = { nombre_usuario, apellido_usuario, usuario, email_usuario, contraseña_actual, contraseña_nueva, confirmacion_contraseña };
        const usuarioActualizado = await usuarioServicio.editarMisDatos(id_usuario_modificacion, datosUsuario);

        res.status(200).json({ message: 'Tus datos han sido actualizados exitosamente', usuario: usuarioActualizado });
    } catch (error) {
        console.error('Error detectado:', error);
        res.status(500).json({ error: 'Error al editar tus datos: ' + error.message });
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
        res.status(500).json({ error: error.message });
    }
};

export const contratarUsuario = async (req, res) => {
    console.log("Solicitud de contratación recibida:", req.body);

    const { nombre_usuario, apellido_usuario, usuario, email_usuario, contraseña_usuario, rol_usuario } = req.body;
    const id_user_creacion = req.user.id;
    const rol = req.user.rol;

    try {
        // Verificar el rol del usuario que realiza la contratación
        if (rol === 'administrador' && rol_usuario !== 'empleado') {
            return res.status(403).json({ message: 'El administrador solo puede contratar empleados.' });
        }

        // Agregar el nuevo usuario
        await usuarioServicio.agregarUsuario({ nombre_usuario, apellido_usuario, usuario, email_usuario, contraseña_usuario, rol_usuario, id_user_creacion });

        res.status(201).json({ message: 'Usuario contratado exitosamente' });
    } catch (error) {
        console.error('Error detectado:', error);
        res.status(500).json({ error: 'Error al contratar usuario: ' + error.message });
    }
};


