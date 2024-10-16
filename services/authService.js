import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authDAO from '../daos/authDAO.js';

const authService = {
    /**
     * Iniciar sesión de usuario validando credenciales y generando un token.
     * @param {string} usuario - Nombre de usuario.
     * @param {string} contraseña_usuario - Contraseña del usuario.
     * @returns {Promise<{ token: string }>} - Token JWT generado.
     */
    iniciarSesion: async (usuario, contraseña_usuario) => {
        const resultados = await authDAO.buscarUsuarioActivo(usuario);

        if (resultados.length === 0) {
            throw { status: 401, message: 'Credenciales inválidas o usuario inactivo.' };
        }

        const usuarioEncontrado = resultados[0];
        const contrasenaValida = await bcrypt.compare(
            contraseña_usuario, 
            usuarioEncontrado.contraseña_usuario
        );

        if (!contrasenaValida) {
            throw { status: 401, message: 'Credenciales inválidas.' };
        }

        // Generar el token JWT incluyendo rol y estado
        const token = jwt.sign(
            { 
                id: usuarioEncontrado.id, 
                rol: usuarioEncontrado.rol_usuario,
                estado: usuarioEncontrado.estado_usuario // Agrega el estado del usuario
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return { token };
    }
};

export default authService;
