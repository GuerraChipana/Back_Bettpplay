import db from '../database/db.js';

class UsuarioDAO {
    async listarUsuarios() {
        const query = 'SELECT * FROM usuarios';
        const [resultados] = await db.query(query);
        return resultados;
    }

    async obtenerUsuarioPorId(id) {
        const query = 'SELECT * FROM usuarios WHERE id = ?';
        const [resultados] = await db.query(query, [id]);
        return resultados[0]; 
    }

    async editarUsuario(id, datosUsuario, id_usuario_modificacion) {
        const queryActualizar = `
            UPDATE usuarios 
            SET nombre_usuario = ?, apellido_usuario = ?, usuario = ?, email_usuario = ?, rol_usuario = ?, id_user_modificacion = ?, fecha_modificacion = NOW() 
            WHERE id = ?
        `;

        await db.query(queryActualizar, [
            datosUsuario.nombre_usuario,
            datosUsuario.apellido_usuario,
            datosUsuario.usuario,
            datosUsuario.email_usuario,
            datosUsuario.rol_usuario,
            id_usuario_modificacion,
            id,
        ]);
        
        return { id, ...datosUsuario };
    }

    async cambiarEstadoUsuario(id, estado, id_usuario_modificacion) {
        const queryActualizar = `
            UPDATE usuarios 
            SET estado_usuario = ?, id_user_modificacion = ?, fecha_modificacion = NOW() 
            WHERE id = ?
        `;

        await db.query(queryActualizar, [estado, id_usuario_modificacion, id]);
        return { id, estado };
    }

    async agregarUsuario(datosUsuario) {
        const queryInsertar = `
            INSERT INTO usuarios (nombre_usuario, apellido_usuario, usuario, email_usuario, contraseña_usuario, rol_usuario, id_user_creacion) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await db.query(queryInsertar, [
            datosUsuario.nombre_usuario,
            datosUsuario.apellido_usuario,
            datosUsuario.usuario,
            datosUsuario.email_usuario,
            datosUsuario.contraseña_usuario,
            datosUsuario.rol_usuario,
            datosUsuario.id_user_creacion,
        ]);
    }
}

export default new UsuarioDAO();
