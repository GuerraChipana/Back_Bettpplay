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
        const usuarioActual = await this.obtenerUsuarioPorId(id);

        const queryActualizar = `
    UPDATE usuarios 
    SET 
        nombre_usuario = ?, 
        apellido_usuario = ?, 
        usuario = ?, 
        email_usuario = ?, 
        contraseña_usuario = ?, 
        id_user_modificacion = ?, 
        fecha_modificacion = NOW() 
    WHERE id = ?
`;

        await db.query(queryActualizar, [
            datosUsuario.nombre_usuario,
            datosUsuario.apellido_usuario,
            datosUsuario.usuario,
            datosUsuario.email_usuario,
            datosUsuario.contraseña_usuario, 
            id_usuario_modificacion,
            id,
        ]);

        return { id, ...datosUsuario };
    }


    async cambiarRolUsuario(id, nuevoRol, id_usuario_modificacion) {
        const queryActualizar = `
            UPDATE usuarios 
            SET rol_usuario = ?, id_user_modificacion = ?, fecha_modificacion = NOW() 
            WHERE id = ?
        `;

        await db.query(queryActualizar, [nuevoRol, id_usuario_modificacion, id]);
        return { id, nuevoRol };
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

    async obtenerUsuarioPorNombre(nombreUsuario, id = null) {
        const query = 'SELECT * FROM usuarios WHERE usuario = ?' + (id ? ' AND id != ?' : '');
        const params = id ? [nombreUsuario, id] : [nombreUsuario];
        const [resultados] = await db.query(query, params);
        return resultados[0]; // Devuelve el primer usuario encontrado
    }

    async obtenerUsuarioPorEmail(emailUsuario, id = null) {
        const query = 'SELECT * FROM usuarios WHERE email_usuario = ?' + (id ? ' AND id != ?' : '');
        const params = id ? [emailUsuario, id] : [emailUsuario];
        const [resultados] = await db.query(query, params);
        return resultados[0]; // Devuelve el primer usuario encontrado
    }

    async agregarUsuario(datosUsuario) {
        console.log("Datos a insertar:", datosUsuario); // Log de los datos

        try {
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

            console.log("Usuario agregado exitosamente."); // Log de éxito
        } catch (error) {
            console.error("Error al agregar usuario:", error); // Log de error
            throw error; // Lanzar error para manejar en el controlador
        }
    }
}

export default new UsuarioDAO();
