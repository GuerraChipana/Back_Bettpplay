import db from '../database/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const authService = {
    iniciarSesion: async (usuario, contraseña_usuario) => {
        const [resultados] = await db.query('SELECT * FROM usuarios WHERE usuario = ? AND estado_usuario = 1', [usuario]);

        if (resultados.length === 0) {
            throw { status: 401, message: 'Credenciales inválidas o usuario inactivo.' };
        }

        const usuarioEncontrado = resultados[0];
        const contrasenaValida = await bcrypt.compare(contraseña_usuario, usuarioEncontrado.contraseña_usuario);

        if (!contrasenaValida) {
            throw { status: 401, message: 'Credenciales inválidas.' };
        }

        // Generar el token JWT
        const token = jwt.sign(
            { id: usuarioEncontrado.id, rol: usuarioEncontrado.rol_usuario },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return { token };
    }
};

export default authService;
