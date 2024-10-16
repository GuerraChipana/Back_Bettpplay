import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authDAO from '../daos/authDAO.js';
const authService = {
    iniciarSesion: async (usuario, contraseña_usuario) => {
        const resultados = await authDAO.buscarUsuarioActivo(usuario);

        if (resultados.length === 0) {
            throw { status: 401, message: 'Usuario no encontrado.' };
        }

        const usuarioEncontrado = resultados[0];

        if (usuarioEncontrado.estado_usuario !== 'activo') {
            throw { status: 403, message: 'Usuario deshabilitado.' };
        }

        // En el método de inicio de sesión
        console.log("Contraseña ingresada:", contraseña_usuario);
        console.log("Contraseña almacenada en la base de datos:", usuarioEncontrado.contraseña_usuario);
        const contrasenaValida = await bcrypt.compare(contraseña_usuario, usuarioEncontrado.contraseña_usuario);
        console.log("¿Son iguales?:", contrasenaValida);


        if (!contrasenaValida) {
            throw { status: 401, message: 'Credenciales inválidas.' };
        }

        const token = jwt.sign(
            {
                id: usuarioEncontrado.id,
                rol: usuarioEncontrado.rol_usuario,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return { token };
    }
};

export default authService;
