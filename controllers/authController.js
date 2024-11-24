import authService from '../services/authService.js';

const loginController = async (req, res) => {
    const { usuario, contraseña_usuario } = req.body;

    if (!usuario || !contraseña_usuario) {
        return res.status(400).json({ message: 'Usuario y contraseña son requeridos.' });
    }

    try {
        const resultado = await authService.iniciarSesion(usuario, contraseña_usuario);

        // Aquí puedes incluir los detalles junto con el token
        res.json({
            message: 'Inicio de sesión exitoso',
            token: resultado.token,
            id: resultado.id,
            usuario: resultado.usuario,
            rol: resultado.rol
        });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};


export { loginController };
