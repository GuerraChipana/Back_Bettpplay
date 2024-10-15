import db from '../database/db.js';
import bcrypt from 'bcrypt';

const userService = {
    obtenerUsuarioPorId: async (id) => {
        const [resultados] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
        if (resultados.length === 0) {
            throw { status: 404, message: 'Usuario no encontrado.' };
        }
        return resultados[0];
    },

    listarUsuarios: async () => {
        const [resultados] = await db.query('SELECT id, nombre_usuario, apellido_usuario, usuario, email_usuario, rol_usuario, estado_usuario FROM usuarios');
        return resultados;
    },

    registrarAdmin: async ({ nombre_usuario, apellido_usuario, usuario, email_usuario, contraseña_usuario, rol_usuario, id_user_creacion }) => {
        const [usuarioExistente] = await db.query('SELECT * FROM usuarios WHERE usuario = ? OR email_usuario = ?', [usuario, email_usuario]);

        if (usuarioExistente.length > 0) {
            throw { status: 400, message: 'El nombre de usuario o el correo electrónico ya están en uso.' };
        }

        const hashedPassword = await bcrypt.hash(contraseña_usuario, 10);
        const [result] = await db.query(
            'INSERT INTO usuarios (nombre_usuario, apellido_usuario, usuario, email_usuario, contraseña_usuario, rol_usuario, estado_usuario, id_user_creacion, fecha_registro) VALUES (?, ?, ?, ?, ?, ?, 1, ?, NOW())',
            [nombre_usuario, apellido_usuario, usuario, email_usuario, hashedPassword, rol_usuario, id_user_creacion]
        );

        return { id: result.insertId, nombre_usuario, apellido_usuario, usuario, email_usuario, rol_usuario };
    },

    cambiarRolUsuario: async (id, rol_usuario, idModificador) => {
        const [usuario] = await db.query('SELECT rol_usuario FROM usuarios WHERE id = ?', [id]);

        if (usuario[0].rol_usuario === 'superadministrador') {
            throw { status: 403, message: 'No puedes cambiar el rol de un superadministrador.' };
        }

        await db.query(
            'UPDATE usuarios SET rol_usuario = ?, id_user_modificacion = ?, fecha_modificacion = NOW() WHERE id = ?',
            [rol_usuario, idModificador, id]
        );
    },

    cambiarEstadoUsuario: async (id, estado_usuario, idModificador) => {
        await db.query(
            'UPDATE usuarios SET estado_usuario = ?, id_user_modificacion = ?, fecha_modificacion = NOW() WHERE id = ?',
            [estado_usuario, idModificador, id]
        );
    },

    editarUsuario: async (id, { nombre_usuario, apellido_usuario, email_usuario, contraseña_usuario }) => {
        const updates = [];
        const values = [];

        if (nombre_usuario) {
            updates.push('nombre_usuario = ?');
            values.push(nombre_usuario);
        }
        if (apellido_usuario) {
            updates.push('apellido_usuario = ?');
            values.push(apellido_usuario);
        }
        if (email_usuario) {
            updates.push('email_usuario = ?');
            values.push(email_usuario);
        }
        if (contraseña_usuario) {
            const hashedPassword = await bcrypt.hash(contraseña_usuario, 10);
            updates.push('contraseña_usuario = ?');
            values.push(hashedPassword);
        }

        if (updates.length > 0) {
            values.push(id);
            await db.query(`UPDATE usuarios SET ${updates.join(', ')}, fecha_modificacion = NOW() WHERE id = ?`, values);
        }

        return await userService.obtenerUsuarioPorId(id);
    },

    eliminarUsuario: async (id) => {
        const [usuario] = await db.query('SELECT rol_usuario FROM usuarios WHERE id = ?', [id]);
        
        if (usuario[0].rol_usuario === 'superadministrador') {
            throw { status: 403, message: 'No puedes eliminar a un superadministrador.' };
        }

        const result = await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            throw { status: 404, message: 'Usuario no encontrado.' };
        }
    }
};

export default userService;
