import db from '../database/db.js';

class AuthDAO {
    /**
     * Buscar un usuario activo por nombre de usuario.
     * @param {string} usuario - Nombre de usuario a buscar.
     * @returns {Promise<Array>} - Lista de usuarios encontrados.
     */
    async buscarUsuarioActivo(usuario) {
        const query = `
            SELECT id, usuario, contraseña_usuario, rol_usuario, estado_usuario 
            FROM usuarios 
            WHERE usuario = ? AND estado_usuario = '1'
        `;
        
        const [resultados] = await db.query(query, [usuario]);
        return resultados;
    }
}

export default new AuthDAO();
